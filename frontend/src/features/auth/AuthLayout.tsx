import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-primary">My Application</h1>
        </Link>
        {children}
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} My Application. Tất cả các quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}
