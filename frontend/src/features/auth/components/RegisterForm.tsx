import { useState } from 'react';
import { Link } from 'react-router-dom';
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

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const { register: registerUser } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>();
  
  const password = watch('password');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Call the register API via AuthContext
      await registerUser(data.username, data.email, data.password);
      
      toast({
        title: 'Đăng ký thành công',
        description: 'Vui lòng kiểm tra email của bạn để xác thực tài khoản.',
        variant: 'success',
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng ký.';
      toast({
        title: 'Đăng ký thất bại',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLoginSuccess = () => {
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      <SocialLogin onSuccess={handleSocialLoginSuccess} mode="register" />
      
      <DividerWithText text="Hoặc đăng ký với email" />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Họ tên</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nguyễn Văn A"
              {...register('username', {
                required: 'Họ tên là bắt buộc',
                minLength: {
                  value: 2,
                  message: 'Họ tên phải có ít nhất 2 ký tự',
                },
              })}
              className={errors.username ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            <FormError error={errors.username} />
          </div>
          
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
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 8,
                    message: 'Mật khẩu phải có ít nhất 8 ký tự',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Xác nhận mật khẩu là bắt buộc',
                  validate: value => 
                    value === password || 'Mật khẩu xác nhận không khớp',
                })}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FormError error={errors.confirmPassword} />
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
            'Tạo tài khoản'
          )}
        </Button>
        
        <div className="text-center text-sm">
          Đã có tài khoản?{' '}
          <Link 
            to="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
