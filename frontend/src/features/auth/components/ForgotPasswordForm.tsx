import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { FormError } from './FormError';

interface ForgotPasswordFormValues {
  email: string;
}

interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Forgot password data:', data);
      toast({
        title: 'Yêu cầu đã được gửi',
        description: 'Một email với mã xác nhận đã được gửi đến địa chỉ email của bạn.',
        variant: 'success',
      });
      
      // Call onSuccess if provided, otherwise navigate
      if (onSuccess) {
        onSuccess(data.email);
      } else {
        // Navigate to verification code page
        navigate('/auth/verification', { state: { email: data.email } });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi gửi yêu cầu.';
      toast({
        title: 'Gửi yêu cầu thất bại',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <p className="text-sm text-muted-foreground">
          Nhập email của bạn và chúng tôi sẽ gửi một mã xác nhận để đặt lại mật khẩu.
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Đang gửi...
          </>
        ) : (
          'Gửi mã xác nhận'
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
