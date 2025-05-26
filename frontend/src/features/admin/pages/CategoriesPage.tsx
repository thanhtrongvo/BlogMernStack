import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Tag,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DataTable } from '@/shared/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/components/ui/use-toast';
import { categoriesAPI } from '@/shared/services/api';

// Define Category interface
interface Category {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  postCount?: number; // This may be calculated on the client or provided by the API
}

// Category Form State
interface CategoryFormData {
  name: string;
  description?: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getAllCategories();
      setCategories(data as Category[]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách danh mục",
        variant: "destructive"
      });
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      if(!formData.name) {
        toast({
          title: "Lỗi",
          description: "Tên danh mục không được để trống",
          variant: "destructive"
        });
        return;
      }
      if(!formData.description) {
        toast({
          title: "Lỗi",
          description: "Mô tả không được để trống",
          variant: "destructive"
        });
        return;
      }

      await categoriesAPI.createCategory(formData);
      toast({
        title: "Thành công",
        description: "Đã thêm danh mục mới",
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchCategories(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm danh mục",
        variant: "destructive"
      });
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategoryId) return;

    try {
      await categoriesAPI.updateCategory(editingCategoryId, formData);
      toast({
        title: "Thành công",
        description: "Danh mục đã được cập nhật",
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchCategories(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật danh mục",
        variant: "destructive"
      });
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoriesAPI.deleteCategory(id);
      toast({
        title: "Thành công",
        description: "Danh mục đã được xóa",
      });
      fetchCategories(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa danh mục",
        variant: "destructive"
      });
      console.error("Error deleting category:", error);
    }
  };

  const openEditDialog = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
    });
    setEditingCategoryId(category._id);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingCategoryId(null);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns definition
  const columns = [
    {
      title: 'Tên danh mục',
      field: 'name' as keyof Category,
      render: (value: any) => (
        <div className="flex items-center gap-3">
          <div className="rounded-full w-4 h-4 bg-primary"></div>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      field: 'description' as keyof Category,
      render: (value: any) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-1">{value}</p>
        </div>
      ),
    },
    {
      title: 'Số bài viết',
      field: 'postCount' as keyof Category,
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{value || 0}</span>
        </div>
      ),
    },
  ];

  const categoryActions = (category: Category) => (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          openEditDialog(category);
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
            handleDeleteCategory(category._id);
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
          <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
          <p className="text-muted-foreground">Tạo và sắp xếp các danh mục trong blog</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Thêm danh mục mới
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Danh sách danh mục</CardTitle>
            <CardDescription>
              Quản lý tất cả danh mục và phân loại bài viết
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm danh mục..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredCategories}
                actions={categoryActions}
              />
            )}
            
            {!loading && filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Tag className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">Không tìm thấy danh mục</h3>
                <p className="text-muted-foreground mt-1">
                  Bắt đầu bằng cách thêm danh mục mới cho blog của bạn
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm danh mục
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Thống kê danh mục</CardTitle>
            <CardDescription>
              Số lượng bài viết trong từng danh mục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                categories.map(category => (
                  <div key={category._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{category.postCount || 0}</span>
                    </div>
                  </div>
                ))
              )}
              
              {!loading && categories.length === 0 && (
                <p className="text-center text-muted-foreground py-6">
                  Chưa có danh mục nào
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Tạo danh mục mới để phân loại các bài viết trên blog
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nhập tên danh mục"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Mô tả ngắn gọn về danh mục này"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAddCategory}>Thêm danh mục</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên danh mục</Label>
              <Input 
                id="edit-name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nhập tên danh mục"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea 
                id="edit-description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Mô tả ngắn gọn về danh mục này"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditCategory}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
