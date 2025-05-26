import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { FormError } from './FormError';

interface VerificationFormValues {
  code: string;
}

export function VerificationCodeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormValues>();

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isCountdownActive]);

  const onSubmit = async (data: VerificationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo - simulate invalid code
      if (data.code === '1111') {
        throw new Error('Mã xác nhận không hợp lệ hoặc đã hết hạn.');
      }
      
      console.log('Verification data:', data);
      toast({
        title: 'Xác nhận thành công',
        description: 'Mã xác nhận hợp lệ. Vui lòng đặt lại mật khẩu mới.',
        variant: 'success',
      });
      
      // Navigate to reset password page
      navigate('/auth/reset-password', { state: { verified: true } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xác nhận.';
      toast({
        title: 'Xác nhận thất bại',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Đã gửi lại mã',
        description: 'Một mã xác nhận mới đã được gửi đến email của bạn.',
        variant: 'success',
      });
      
      // Reset countdown
      setCountdown(60);
      setIsCountdownActive(true);
    } catch (error) {
      toast({
        title: 'Gửi mã thất bại',
        description: 'Không thể gửi lại mã xác nhận. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!email) {
    return (
      <div className="text-center">
        <p className="mb-4">Không tìm thấy thông tin email. Vui lòng quay lại bước trước.</p>
        <Button asChild>
          <Link to="/auth/forgot-password">Quay lại</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">Mã xác nhận</Label>
        <Input
          id="code"
          type="text"
          placeholder="Nhập mã 6 chữ số"
          maxLength={6}
          className={`text-center text-lg tracking-widest ${errors.code ? 'border-destructive' : ''}`}
          {...register('code', {
            required: 'Mã xác nhận là bắt buộc',
            pattern: {
              value: /^[0-9]{6}$/,
              message: 'Mã xác nhận phải gồm 6 chữ số',
            },
          })}
          disabled={isSubmitting}
        />
        <FormError error={errors.code} />
        <p className="text-sm text-muted-foreground">
          Mã xác nhận 6 chữ số đã được gửi đến <span className="font-medium">{email}</span>
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
            Đang xác nhận...
          </>
        ) : (
          'Xác nhận'
        )}
      </Button>
      
      <div className="text-center text-sm">
        {isCountdownActive ? (
          <p className="text-muted-foreground">
            Gửi lại mã sau {countdown} giây
          </p>
        ) : (
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={handleResendCode}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 
                Đang gửi...
              </>
            ) : (
              'Gửi lại mã'
            )}
          </Button>
        )}
      </div>
      
      <div className="text-center text-sm">
        <Link 
          to="/auth/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Thay đổi email
        </Link>
      </div>
    </form>
  );
}
