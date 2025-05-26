import { AuthLayout } from '../AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Đăng nhập"
        description="Nhập thông tin tài khoản của bạn để đăng nhập"
      >
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
