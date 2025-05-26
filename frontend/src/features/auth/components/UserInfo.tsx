import { useAuth } from '@/shared/contexts/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';

interface UserInfoProps {
  showAdminLink?: boolean;
}

export function UserInfo({ showAdminLink = false }: UserInfoProps) {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated || !user) {
    return (
      <div className="flex gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth/login">Đăng nhập</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/auth/register">Đăng ký</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-4">
      <div className="text-sm hidden md:block">
        <p className="font-medium">Xin chào, {user.username}</p>
        <p className="text-muted-foreground text-xs">{user.email}</p>
      </div>
      
      <div className="flex gap-2">
        {showAdminLink && user.role === 'admin' && (
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">Quản trị</Link>
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => logout()}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
