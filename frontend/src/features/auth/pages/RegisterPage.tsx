import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { RegisterForm } from '../components/RegisterForm';
import { Button } from '@/shared/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const [registered, setRegistered] = useState(false);

  // This function will be passed to the RegisterForm component
  const onRegisterSuccess = () => {
    setRegistered(true);
  };

  if (registered) {
    return (
      <AuthLayout>
        <AuthCard title="Đăng ký thành công">
          <div className="text-center space-y-4">
            <div className="mx-auto rounded-full bg-green-100 w-20 h-20 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Tài khoản đã được tạo!</h3>
            <p className="text-muted-foreground">
              Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn để hoàn tất quá trình đăng ký.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/auth/login">
                Đến trang đăng nhập <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Tạo tài khoản mới"
        description="Nhập thông tin của bạn để tạo tài khoản"
      >
        <RegisterForm onSuccess={onRegisterSuccess} />
      </AuthCard>
    </AuthLayout>
  );
}

