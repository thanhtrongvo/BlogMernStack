import { useState } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { AuthGuard } from '../components/AuthGuard';
import { AuthLayout } from '../AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // This would connect to an API to update user profile
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Cập nhật thành công',
        description: 'Thông tin cá nhân của bạn đã được cập nhật',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Cập nhật thất bại',
        description: 'Đã xảy ra lỗi khi cập nhật thông tin',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <AuthGuard>
      <AuthLayout>
        <AuthCard title="Thông tin cá nhân">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Họ tên</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isUpdating}
                  placeholder="Nhập họ tên"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true} // Email không thể thay đổi
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  Email không thể thay đổi sau khi đăng ký
                </p>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật thông tin'
              )}
            </Button>
          </form>
        </AuthCard>
      </AuthLayout>
    </AuthGuard>
  );
}
