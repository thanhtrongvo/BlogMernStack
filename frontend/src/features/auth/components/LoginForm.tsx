import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { FormError } from './FormError';
import { SocialLogin } from './SocialLogin';
import { DividerWithText } from './DividerWithText';
import { useAuth } from '@/shared/contexts/AuthContext';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get redirect path from location state, or default to home
  const from = location.state?.from || '/';
  
  // Check if redirected due to account being disabled
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const error = searchParams.get('error');
    
    if (error === 'account_disabled') {
      toast({
        title: 'Tài khoản đã bị vô hiệu hóa',
        description: 'Tài khoản của bạn đã bị quản trị viên vô hiệu hóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.',
        variant: 'destructive',
      });
      
      // Remove the query parameter to prevent showing the message again on page refresh
      navigate('/auth/login', { replace: true });
    }
  }, [location, toast, navigate]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      await login(data.email, data.password);
      
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay trở lại!',
        variant: 'success',
      });
      
      // Redirect to the original requested page or home
      navigate(from, { replace: true });
    } catch (error: any) {
      let errorMessage = 'Đã xảy ra lỗi khi đăng nhập.';
      
      // Check if error response contains a message
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Đăng nhập thất bại',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLoginSuccess = () => {
    // Handle successful social login - redirect is handled in the SocialLogin component
    console.log('Social login successful');
  };

  return (
    <div className="space-y-6">
      <SocialLogin onSuccess={handleSocialLoginSuccess} mode="login" />
      
      <DividerWithText text="Hoặc đăng nhập với email" />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email không hợp lệ',
                },
              })}
              className={errors.email ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            <FormError error={errors.email} />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link 
                to="/auth/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                  },
                })}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FormError error={errors.password} />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Đang xử lý...
            </>
          ) : (
            'Đăng nhập'
          )}
        </Button>
        
        <div className="text-center text-sm">
          Chưa có tài khoản?{' '}
          <Link 
            to="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Tạo tài khoản
          </Link>
        </div>
      </form>
    </div>
  );
}
