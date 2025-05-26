import { useState } from 'react';
import { 
  Save, 
  Settings, 
  Mail, 
  Bell, 
  Shield, 
  Database,
  Paintbrush,
  CloudUpload,
  Check
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';

export function SettingsPage() {
  const [notification, setNotification] = useState<string | null>(null);
  
  const showSaveNotification = () => {
    setNotification('Đã lưu thành công!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground">Quản lý các cài đặt và tùy chỉnh cho blog</p>
        </div>
      </div>

      {notification && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          {notification}
        </div>
      )}

      <Tabs defaultValue="general">
        <div className="border-b">
          <TabsList className="bg-transparent -mb-px">
            <TabsTrigger value="general" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt chung
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Paintbrush className="h-4 w-4 mr-2" />
              Giao diện
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Bell className="h-4 w-4 mr-2" />
              Thông báo
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Shield className="h-4 w-4 mr-2" />
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Database className="h-4 w-4 mr-2" />
              Nâng cao
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* General Settings */}
        <TabsContent value="general" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>
                  Cài đặt thông tin cơ bản cho blog của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Tên Blog</Label>
                  <Input id="siteName" defaultValue="Go Dev Blog" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Mô tả</Label>
                  <textarea 
                    id="siteDescription" 
                    className="w-full min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    defaultValue="Blog chia sẻ về ứng dụng AI vào thực tiễn; tự động hóa quy trình với Make.com và N8N."
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email quản trị</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    defaultValue="admin@godevblog.com" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <select 
                    id="timezone"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs"
                    defaultValue="Asia/Ho_Chi_Minh"
                  >
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                    <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>URL và SEO</CardTitle>
                <CardDescription>
                  Cài đặt URL và các tùy chọn tối ưu SEO
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL Blog</Label>
                  <Input id="siteUrl" defaultValue="https://godevblog.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="permalinkStructure">Cấu trúc Permalink</Label>
                  <select 
                    id="permalinkStructure"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs"
                    defaultValue="/%year%/%monthnum%/%postname%/"
                  >
                    <option value="/%year%/%monthnum%/%postname%/">https://godevblog.com/2025/05/ten-bai-viet/</option>
                    <option value="/%postname%/">https://godevblog.com/ten-bai-viet/</option>
                    <option value="/blog/%postname%/">https://godevblog.com/blog/ten-bai-viet/</option>
                    <option value="/%category%/%postname%/">https://godevblog.com/danh-muc/ten-bai-viet/</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="enableSitemap" 
                    defaultChecked 
                    className="rounded"
                  />
                  <Label htmlFor="enableSitemap" className="text-sm">
                    Tự động tạo Sitemap
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="enableRobots" 
                    defaultChecked 
                    className="rounded"
                  />
                  <Label htmlFor="enableRobots" className="text-sm">
                    Cho phép robot tìm kiếm
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="enableOgTags" 
                    defaultChecked 
                    className="rounded"
                  />
                  <Label htmlFor="enableOgTags" className="text-sm">
                    Tự động tạo Open Graph tags
                  </Label>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Mạng xã hội</CardTitle>
                <CardDescription>
                  Liên kết với các kênh mạng xã hội của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input id="facebook" placeholder="https://facebook.com/yourusername" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input id="twitter" placeholder="https://twitter.com/yourusername" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input id="linkedin" placeholder="https://linkedin.com/in/yourusername" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input id="youtube" placeholder="https://youtube.com/@yourchannel" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex items-center justify-end gap-4">
            <Button variant="outline">Hủy</Button>
            <Button onClick={showSaveNotification}>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme và Màu sắc</CardTitle>
                <CardDescription>
                  Tùy chỉnh giao diện và màu sắc cho blog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chủ đề</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border rounded-md p-2 cursor-pointer border-primary">
                      <div className="h-20 bg-gradient-to-b from-primary/20 to-primary/40 rounded-md mb-2"></div>
                      <p className="text-sm text-center">Light</p>
                    </div>
                    <div className="border rounded-md p-2 cursor-pointer">
                      <div className="h-20 bg-gradient-to-b from-gray-700 to-gray-900 rounded-md mb-2"></div>
                      <p className="text-sm text-center">Dark</p>
                    </div>
                    <div className="border rounded-md p-2 cursor-pointer">
                      <div className="h-20 bg-gradient-to-b from-primary/20 to-gray-800 rounded-md mb-2"></div>
                      <p className="text-sm text-center">System</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Màu chính</Label>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="h-6 rounded-md bg-indigo-500 cursor-pointer ring-2 ring-offset-2 ring-indigo-500"></div>
                    <div className="h-6 rounded-md bg-blue-500 cursor-pointer"></div>
                    <div className="h-6 rounded-md bg-green-500 cursor-pointer"></div>
                    <div className="h-6 rounded-md bg-yellow-500 cursor-pointer"></div>
                    <div className="h-6 rounded-md bg-red-500 cursor-pointer"></div>
                    <div className="h-6 rounded-md bg-purple-500 cursor-pointer"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="headerStyle">Kiểu Header</Label>
                  <select 
                    id="headerStyle"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs"
                    defaultValue="default"
                  >
                    <option value="default">Mặc định</option>
                    <option value="centered">Canh giữa</option>
                    <option value="minimal">Tối giản</option>
                    <option value="transparent">Trong suốt</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="footerStyle">Kiểu Footer</Label>
                  <select 
                    id="footerStyle"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs"
                    defaultValue="default"
                  >
                    <option value="default">Mặc định</option>
                    <option value="expanded">Mở rộng</option>
                    <option value="minimal">Tối giản</option>
                    <option value="dark">Tối màu</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Logo và Hình ảnh</CardTitle>
                <CardDescription>
                  Tùy chỉnh logo và hình ảnh cho blog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <div className="bg-gray-100 rounded-md p-4 inline-flex mb-4">
                      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-gray-700">
                        Go Dev Blog
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-muted-foreground mb-2">Tải lên logo mới hoặc tiếp tục sử dụng text</p>
                      <Button variant="outline" size="sm">
                        <CloudUpload className="h-4 w-4 mr-2" />
                        Tải lên
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <div className="bg-primary w-10 h-10 rounded-md flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">G</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-muted-foreground mb-2">Tải lên favicon mới (32x32px)</p>
                      <Button variant="outline" size="sm">
                        <CloudUpload className="h-4 w-4 mr-2" />
                        Tải lên
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customCss">CSS tùy chỉnh</Label>
                  <textarea 
                    id="customCss" 
                    className="w-full min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono"
                    placeholder="/* CSS tùy chỉnh của bạn */"
                  ></textarea>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex items-center justify-end gap-4">
            <Button variant="outline">Hủy</Button>
            <Button onClick={showSaveNotification}>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </TabsContent>
        
        {/* Email Settings */}
        <TabsContent value="email" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Email</CardTitle>
              <CardDescription>
                Cấu hình email cho hệ thống blog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input id="smtpHost" defaultValue="smtp.example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input id="smtpPort" defaultValue="587" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input id="smtpUser" defaultValue="no-reply@godevblog.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input id="smtpPassword" type="password" defaultValue="********" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emailFrom">From Email</Label>
                  <Input id="emailFrom" defaultValue="no-reply@godevblog.com" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emailSubjectPrefix">Email Subject Prefix</Label>
                  <Input id="emailSubjectPrefix" defaultValue="[Go Dev Blog]" />
                </div>
                
                <div className="md:col-span-2">
                  <Button variant="outline" className="w-full">
                    Gửi email kiểm tra
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-4 mt-4">
                <h4 className="font-medium">Mẫu Email</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">Xác nhận đăng ký</h5>
                        <Badge variant="outline">Hệ thống</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Gửi khi người dùng đăng ký mới</p>
                      <Button variant="ghost" size="sm" className="mt-2 w-full">Chỉnh sửa</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">Đặt lại mật khẩu</h5>
                        <Badge variant="outline">Hệ thống</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Gửi khi người dùng yêu cầu đặt lại mật khẩu</p>
                      <Button variant="ghost" size="sm" className="mt-2 w-full">Chỉnh sửa</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">Thông báo bình luận</h5>
                        <Badge variant="outline">Hệ thống</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Gửi khi có bình luận mới trên bài viết</p>
                      <Button variant="ghost" size="sm" className="mt-2 w-full">Chỉnh sửa</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 flex items-center justify-end gap-4">
            <Button variant="outline">Hủy</Button>
            <Button onClick={showSaveNotification}>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </TabsContent>
        
        {/* Other tabs would be similarly defined */}
      </Tabs>
    </div>
  );
}
