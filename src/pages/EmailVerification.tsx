import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailVerification = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const params = new URLSearchParams(search);
        const token = params.get('token');
        
        if (!token) {
          setIsSuccess(false);
          setMessage('Token xác minh không hợp lệ hoặc đã hết hạn.');
          setIsLoading(false);
          return;
        }
        
        // Gọi API xác minh email
        await verifyEmail(token);
        
        setIsSuccess(true);
        setMessage('Email của bạn đã được xác minh thành công!');
      } catch (error: any) {
        setIsSuccess(false);
        setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xác minh email của bạn.');
        console.error('Lỗi xác minh email:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [search, verifyEmail]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-180px)]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <h3 className="font-medium text-lg">Đang xác minh email của bạn...</h3>
              <p className="text-muted-foreground text-center">
                Vui lòng đợi trong giây lát khi chúng tôi xác minh email của bạn.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-180px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Xác minh thành công!</CardTitle>
            <CardDescription className="text-center">
              Email của bạn đã được xác minh
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-center space-y-4">
              <h3 className="font-medium text-lg">Xác minh thành công</h3>
              <p className="text-muted-foreground">
                {message}
              </p>
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription className="text-sm">
                  Bạn có thể đăng nhập vào hệ thống ngay bây giờ.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/login">Đăng nhập ngay</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-180px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Xác minh không thành công</CardTitle>
          <CardDescription className="text-center">
            Không thể xác minh email của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-6">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="font-medium text-lg">Xác minh thất bại</h3>
            <p className="text-muted-foreground">
              {message}
            </p>
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                Liên kết xác minh có thể đã hết hạn hoặc không hợp lệ. Vui lòng thử lại hoặc yêu cầu gửi lại email xác minh.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 items-center">
          <Button asChild variant="default">
            <Link to="/login">Đăng nhập và yêu cầu xác minh mới</Link>
          </Button>
          <Link to="/" className="text-sm text-primary hover:underline">
            Quay lại trang chủ
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailVerification;