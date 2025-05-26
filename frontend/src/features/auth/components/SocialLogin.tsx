import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SocialLoginProps {
  onSuccess?: () => void;
  mode?: 'login' | 'register';
}

export function SocialLogin({ onSuccess, mode = 'login' }: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call your backend API
      // For example:
      // const response = await fetch('/api/auth/social-login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ provider })
      // });
      // if (!response.ok) throw new Error('Authentication failed');
      // const data = await response.json();
      
      console.log(`${mode === 'login' ? 'Login' : 'Register'} with ${provider}`);
      toast({
        title: mode === 'login' ? 'Đăng nhập thành công' : 'Đăng ký thành công',
        description: `Đã ${mode === 'login' ? 'đăng nhập' : 'đăng ký'} với ${provider === 'google' ? 'Google' : 'Facebook'}`,
        variant: 'success',
      });
      
      // Redirect to homepage after successful login, or call onSuccess
      if (mode === 'login') {
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Social login error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Không thể ${mode === 'login' ? 'đăng nhập' : 'đăng ký'} với ${provider === 'google' ? 'Google' : 'Facebook'}`;
      
      toast({
        title: mode === 'login' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => handleSocialLogin('google')}
        disabled={isLoading !== null}
      >
        {isLoading === 'google' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="h-4 w-4 text-red-500" />
        )}
        <span>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'} với Google</span>
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => handleSocialLogin('facebook')}
        disabled={isLoading !== null}
      >
        {isLoading === 'facebook' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FaFacebook className="h-4 w-4 text-blue-600" />
        )}
        <span>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'} với Facebook</span>
      </Button>
    </div>
  );
}
