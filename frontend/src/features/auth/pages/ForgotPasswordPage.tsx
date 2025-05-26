import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { Button } from '@/shared/components/ui/button';
import { Mail } from 'lucide-react';

export function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const onForgotPasswordSuccess = (email: string) => {
    setEmail(email);
    setEmailSent(true);
  };

  const handleContinue = () => {
    navigate('/auth/verification', { state: { email } });
  };

  if (emailSent) {
    return (
      <AuthLayout>
        <AuthCard title="Kiểm tra email của bạn">
          <div className="text-center space-y-4">
            <div className="mx-auto rounded-full bg-blue-100 w-20 h-20 flex items-center justify-center">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Mã xác nhận đã được gửi!</h3>
            <p className="text-muted-foreground">
              Chúng tôi đã gửi mã xác nhận đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến và nhập mã để tiếp tục.
            </p>
            <Button className="mt-4 w-full" onClick={handleContinue}>
              Tiếp tục
            </Button>
            <div className="text-center text-sm pt-2">
              <Link 
                to="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Quên mật khẩu"
        description="Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu"
      >
        <ForgotPasswordForm onSuccess={onForgotPasswordSuccess} />
      </AuthCard>
    </AuthLayout>
  );
}
