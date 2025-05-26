import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  Eye, 
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DataTable } from '@/shared/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useToast } from '@/shared/components/ui/use-toast';
import { postsAPI } from '@/shared/services/api';
import { format } from 'date-fns';

// Define post type
interface Post {
  _id: string;
  title: string;
  author: string;
  createdAt: string;
  status: boolean;
  category: {
    _id: string;
    name: string;
  };
  views: number;
}

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getAllPosts();
      setPosts(data as Post[]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài viết",
        variant: "destructive"
      });
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await postsAPI.deletePost(id);
      toast({
        title: "Thành công",
        description: "Bài viết đã được xóa",
      });
      fetchPosts(); // Refresh list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết",
        variant: "destructive"
      });
      console.error("Error deleting post:", error);
    }
  };

  const handleAddPost = () => {
    navigate('/admin/posts/new');
  };

  const handleEditPost = (id: string) => {
    navigate(`/admin/posts/edit/${id}`);
  };

  const handleViewPost = (id: string) => {
    // In a real app, navigate to the public view of the post
    window.open(`/posts/${id}`, '_blank');
  };
  
  // Filter posts based on search term and active tab
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (post.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'published') return matchesSearch && post.status === true;
    if (activeTab === 'draft') return matchesSearch && post.status === false;
    
    return matchesSearch;
  });

  // Table columns definition
  const columns = [
    {
      title: 'Tiêu đề',
      field: 'title' as keyof Post,
      render: (value: any, post: Post) => (
        <div className="flex items-start gap-3">
          <div className="bg-gray-100 p-2 rounded">
            <FileText className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{post.category?.name || 'Chưa phân loại'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Tác giả',
      field: 'author' as keyof Post,
    },
    {
      title: 'Ngày đăng',
      field: 'createdAt' as keyof Post,
      render: (value: any) => (
        <span>{format(new Date(value), 'dd/MM/yyyy')}</span>
      ),
    },
    {
      title: 'Trạng thái',
      field: 'status' as keyof Post,
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'outline'}>
          {value ? 'Công khai' : 'Nháp'}
        </Badge>
      ),
    },
    {
      title: 'Lượt xem',
      field: 'views' as keyof Post,
      render: (value: any) => (
        <div className="flex items-center">
          <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
  ];

  const postActions = (post: Post): ReactNode => (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleEditPost(post._id);
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleViewPost(post._id);
        }}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            handleDeletePost(post._id);
          }
        }}
      >
        <Trash className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý bài viết</h1>
          <p className="text-muted-foreground">Quản lý tất cả bài viết trên blog của bạn</p>
        </div>
        <Button className="gap-2" onClick={handleAddPost}>
          <Plus className="h-4 w-4" />
          Thêm bài viết mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách bài viết</CardTitle>
          <CardDescription>
            Quản lý và chỉnh sửa bài viết trên blog của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm bài viết..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 whitespace-nowrap">
                <Filter className="h-4 w-4" />
                Lọc bài viết
              </Button>
            </div>
            
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Tất cả ({posts.length})</TabsTrigger>
                <TabsTrigger value="published">
                  Công khai ({posts.filter(p => p.status === true).length})
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Nháp ({posts.filter(p => p.status === false).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredPosts}
              onRowClick={(post) => handleEditPost(post._id)}
              actions={postActions}
            />
          )}
          
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Không tìm thấy bài viết</h3>
              <p className="text-muted-foreground mt-1">
                Không có bài viết nào khớp với từ khóa tìm kiếm của bạn
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Xóa tìm kiếm
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
