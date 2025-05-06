import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const GoogleCallback = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      setError(error);
      toast({
        variant: 'destructive',
        title: 'Đăng nhập thất bại',
        description: 'Không thể đăng nhập với tài khoản Google của bạn.',
      });
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!token) {
      setError('Không nhận được token xác thực');
      toast({
        variant: 'destructive',
        title: 'Đăng nhập thất bại',
        description: 'Không nhận được token xác thực từ Google.',
      });
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Xử lý đăng nhập
    const handleGoogleCallback = async () => {
      try {
        // Set token trong AuthContext
        await login({ token });
        
        toast({
          title: 'Đăng nhập thành công',
          description: 'Bạn đã đăng nhập với tài khoản Google.',
        });
        
        // Chuyển hướng đến trang dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Google callback error:', error);
        setError('Lỗi xác thực Google');
        
        toast({
          variant: 'destructive',
          title: 'Đăng nhập thất bại',
          description: 'Có lỗi xảy ra khi xác thực với tài khoản Google.',
        });
        
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleGoogleCallback();
  }, [search, navigate, login, toast]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-180px)]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {error ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Đăng nhập thất bại</h2>
              <p className="text-gray-600">{error}</p>
              <p className="mt-4 text-sm text-gray-500">Đang chuyển hướng về trang đăng nhập...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Đang xác thực...</h2>
              <p className="text-gray-600">Vui lòng đợi trong giây lát khi chúng tôi hoàn tất quá trình đăng nhập của bạn.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCallback;