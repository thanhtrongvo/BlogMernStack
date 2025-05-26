import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { FormError } from './FormError';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user came from verification page
  const isVerified = location.state?.verified === true;
  
  useEffect(() => {
    // If user tries to access this page directly without verification
    if (!isVerified && !isSuccess) {
      navigate('/auth/forgot-password');
    }
  }, [isVerified, isSuccess, navigate]);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>();
  
  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Reset password data:', data);
      toast({
        title: 'Đặt lại mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập bằng mật khẩu mới.',
        variant: 'success',
      });
      
      setIsSuccess(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đặt lại mật khẩu.';
      toast({
        title: 'Đặt lại mật khẩu thất bại',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto rounded-full bg-green-100 w-20 h-20 flex items-center justify-center">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold">Mật khẩu đã được đặt lại!</h3>
        <p className="text-muted-foreground">
          Mật khẩu của bạn đã được cập nhật thành công.
        </p>
        <Button asChild className="mt-4">
          <Link to="/auth/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu mới</Label>
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
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
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
          <p className="text-sm text-muted-foreground">
            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
          </p>
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
          'Đặt lại mật khẩu'
        )}
      </Button>
      
      <div className="text-center text-sm">
        <Link 
          to="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
}
