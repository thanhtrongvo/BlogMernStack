import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { 
  Save, 
  Image, 
  Eye, 
  ChevronLeft,
  Tags,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { postsAPI, categoriesAPI } from '@/shared/services/api';
import { format } from 'date-fns';
import type { ApiCategory } from '@/shared/types';

interface PostFormData {
  title: string;
  content: string;
  image: string;
  category: string;
  status: boolean;
}

export function PostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Remove editorRef as we'll use state for markdown content
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    image: '',
    category: '',
    status: false
  });
  
  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch categories
        const categoriesData = await categoriesAPI.getAllCategories() as ApiCategory[];
        setCategories(categoriesData);
        
        // If editing, fetch post data
        if (isEditing) {
          const postData = await postsAPI.getPostById(id) as any;
          setFormData({
            title: postData.title,
            content: postData.content,
            image: postData.image,
            category: postData.category?._id || '',
            status: postData.status
          });
          // Content will be set via formData state
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description: isEditing 
            ? "Không thể tải thông tin bài viết" 
            : "Không thể tải danh sách danh mục",
          variant: "destructive"
        });
        console.error("Error fetching data:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setLoading(true);
    
    try {
      // Create a FormData object to send the image
      const formData = new FormData();
      formData.append('image', file);
      
      // Make a direct fetch call to the upload endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('blogAccessToken')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
      
      const result = await response.json();
      
      // Update form data with the Cloudinary URL
      setFormData(prev => ({ ...prev, image: result.url }));
      
      toast({
        title: "Thành công",
        description: "Đã tải lên hình ảnh",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên hình ảnh",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      // Reset the file input
      if (e.target) e.target.value = '';
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => {
      if (prev.category === categoryId) {
        return prev; // No change if unselecting the only selected category
      }
      return { ...prev, category: categoryId };
    });
  };

  const handleSaveDraft = async () => {
    await savePost(false);
  };
  
  const handlePublish = async () => {
    await savePost(true);
  };
  
  const savePost = async (status: boolean) => {
    if (!formData.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung bài viết",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare post data
      const postData = {
        ...formData,
        status
      };
      
      if (isEditing) {
        // Update existing post
        await postsAPI.updatePost(id, postData);
        toast({
          title: "Thành công",
          description: status 
            ? "Bài viết đã được cập nhật và công khai" 
            : "Bài viết đã được lưu dưới dạng nháp",
        });
      } else {
        // Create new post
        await postsAPI.createPost(postData);
        toast({
          title: "Thành công",
          description: status 
            ? "Bài viết mới đã được tạo và công khai" 
            : "Bài viết mới đã được lưu dưới dạng nháp",
        });
      }
      
      // Navigate back to posts list
      navigate('/admin/posts');
    } catch (error) {
      toast({
        title: "Lỗi",
        description: isEditing 
          ? "Không thể cập nhật bài viết" 
          : "Không thể tạo bài viết mới",
        variant: "destructive"
      });
      console.error("Error saving post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/admin/posts')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Cập nhật nội dung và thông tin bài viết' : 'Viết và xuất bản bài viết mới cho blog của bạn'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <Label htmlFor="title" className="text-base">Tiêu đề bài viết</Label>
                <Input 
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề bài viết" 
                  className="text-lg mt-2"
                />
              </div>
              
              <div>
                <Label className="text-base">Nội dung bài viết</Label>
                <div className="mt-2">
                  <MDEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value || '' }))}
                    height={600}
                    data-color-mode="light"
                    preview="edit"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-80 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="w-[48%]"
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu nháp
                    </>
                  )}
                </Button>
                <Button 
                  className="w-[48%]"
                  onClick={handlePublish}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Xuất bản
                    </>
                  )}
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Ảnh đại diện</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="Nhập URL hình ảnh" 
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      type="button"
                    >
                      Tải lên
                    </Button>
                    <input 
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  {formData.image && (
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={formData.image} 
                        alt="Ảnh đại diện bài viết"
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+Loading+Image';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Tags className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Danh mục</h3>
                </div>
                
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`category-${category._id}`}
                        checked={formData.category === category._id}
                        onChange={() => handleCategoryChange(category._id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label 
                        htmlFor={`category-${category._id}`}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color || '#6366F1' }}
                        ></div>
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {isEditing && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Thông tin</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tạo lúc:</span>
                      <span>{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <Badge variant={formData.status ? 'success' : 'outline'}>
                        {formData.status ? 'Công khai' : 'Nháp'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
