import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash, 
  User,
  Shield,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DataTable } from '@/shared/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Avatar } from '@/shared/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/use-toast';
import { usersAPI } from '@/shared/services/api';
import { format } from 'date-fns';

// Define User interface
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  posts: string[];
}

// User form data interface
interface UserFormData {
  username: string;
  email: string;
  password?: string;  // Making password optional
  role: string;
  status?: boolean;   // Adding status field
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAllUsers();
      setUsers(data as User[]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      await usersAPI.createUser(formData);
      toast({
        title: "Thành công",
        description: "Đã thêm người dùng mới",
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm người dùng",
        variant: "destructive"
      });
      console.error("Error adding user:", error);
    }
  };

  const handleEditUser = async () => {
    if (!editingUserId) return;

    // Create a copy without password if it's empty (not changing password)
    const dataToSend = { ...formData };
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      await usersAPI.updateUser(editingUserId, dataToSend);
      toast({
        title: "Thành công",
        description: "Người dùng đã được cập nhật",
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật người dùng",
        variant: "destructive"
      });
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await usersAPI.deleteUser(id);
      toast({
        title: "Thành công",
        description: "Người dùng đã được xóa",
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive"
      });
      console.error("Error deleting user:", error);
    }
  };

  const openEditDialog = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Empty password means don't update it
      role: user.role,
      status: user.status
    });
    setEditingUserId(user._id);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      status: true
    });
    setEditingUserId(null);
  };

  // Filter users based on search term and active tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'admin') return matchesSearch && user.role === 'admin';
    if (activeTab === 'user') return matchesSearch && user.role === 'user';
    if (activeTab === 'active') return matchesSearch && user.status === true;
    if (activeTab === 'inactive') return matchesSearch && user.status === false;
    
    return matchesSearch;
  });

  // Helper function to get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Admin</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>User</span>
          </Badge>
        );
    }
  };

  // Table columns definition
  const columns = [
    {
      title: 'Tên người dùng',
      field: 'username' as keyof User,
      render: (value: string, user: User) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={value}
            useReactAvatar={true}
            avatarSize="40"
            avatarColor="#4F46E5"
            avatarFgColor="#FFFFFF"
          />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      field: 'role' as keyof User,
      render: (value: string) => getRoleBadge(value),
    },
    {
      title: 'Trạng thái',
      field: 'status' as keyof User,
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'destructive'}>
          {value ? 'Đang hoạt động' : 'Đã khóa'}
        </Badge>
      ),
    },
    {
      title: 'Hoạt động gần đây',
      field: 'updatedAt' as keyof User,
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(value), 'dd/MM/yyyy HH:mm')}</span>
        </div>
      ),
    },
    {
      title: 'Số bài viết',
      field: 'posts' as keyof User,
      render: (value: string[]) => (
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{(value || []).length}</span>
        </div>
      ),
    },
  ];

  const userActions = (user: User) => (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          openEditDialog(user);
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
            handleDeleteUser(user._id);
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
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý tất cả người dùng của blog</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Thêm người dùng mới
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Quản lý thông tin tài khoản và phân quyền người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 whitespace-nowrap">
                <Filter className="h-4 w-4" />
                Lọc người dùng
              </Button>
            </div>
            
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Tất cả ({users.length})</TabsTrigger>
                <TabsTrigger value="admin">
                  Admin ({users.filter(u => u.role === 'admin').length})
                </TabsTrigger>
                <TabsTrigger value="user">
                  User ({users.filter(u => u.role === 'user').length})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Hoạt động ({users.filter(u => u.status === true).length})
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  Đã khóa ({users.filter(u => u.status === false).length})
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
              data={filteredUsers}
              actions={userActions}
            />
          )}
          
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Không tìm thấy người dùng</h3>
              <p className="text-muted-foreground mt-1">
                Không có người dùng nào khớp với từ khóa tìm kiếm của bạn
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

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản người dùng mới cho blog
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên người dùng</Label>
              <Input 
                id="username" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Nhập tên người dùng"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@gmail.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="•••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select 
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAddUser}>Thêm người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và phân quyền người dùng
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Tên người dùng</Label>
              <Input 
                id="edit-username" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Nhập tên người dùng"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@gmail.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">Mật khẩu (để trống nếu không muốn thay đổi)</Label>
              <Input 
                id="edit-password" 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="•••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Vai trò</Label>
              <Select 
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Trạng thái tài khoản</Label>
              <Select 
                value={formData.status?.toString() || "true"}
                onValueChange={(value) => setFormData({...formData, status: value === "true"})}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Đang hoạt động</SelectItem>
                  <SelectItem value="false">Vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Nếu tài khoản bị vô hiệu hóa, người dùng sẽ không thể đăng nhập và sẽ bị đăng xuất nếu đang đăng nhập.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditUser}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
