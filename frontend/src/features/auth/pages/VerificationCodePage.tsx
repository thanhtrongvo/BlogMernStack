import { AuthLayout } from '../AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { VerificationCodeForm } from '../components/VerificationCodeForm';

export function VerificationCodePage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Nhập mã xác nhận"
        description="Nhập mã xác nhận 6 chữ số đã được gửi đến email của bạn"
      >
        <VerificationCodeForm />
      </AuthCard>
    </AuthLayout>
  );
}
