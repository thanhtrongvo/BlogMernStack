import { AuthLayout } from '../AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Đặt lại mật khẩu"
        description="Tạo mật khẩu mới cho tài khoản của bạn"
      >
        <ResetPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}
