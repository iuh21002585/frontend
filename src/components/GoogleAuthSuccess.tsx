import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { processGoogleAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        // Lấy token và userId từ URL params
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        
        if (!token || !userId) {
          console.error('Missing token or userId in URL parameters');
          setError('Thiếu thông tin xác thực. Vui lòng thử lại.');
          return;
        }
        
        console.log('Processing Google auth with token and userId');
        
        // Xử lý thông tin đăng nhập Google
        await processGoogleAuth(token, userId);
        
        // Chuyển hướng người dùng đến trang chính sau khi đăng nhập thành công
        navigate('/');
      } catch (err) {
        console.error('Error processing Google auth:', err);
        setError('Đã xảy ra lỗi khi xử lý đăng nhập Google. Vui lòng thử lại.');
      }
    };
    
    processAuth();
  }, [searchParams, processGoogleAuth, navigate]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-destructive/10 p-4 rounded-md mb-4">
          <p className="text-destructive">{error}</p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Quay lại trang đăng nhập
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg font-medium">Đang xử lý đăng nhập...</p>
      <p className="text-muted-foreground text-sm">Vui lòng đợi trong giây lát</p>
    </div>
  );
};

export default GoogleAuthSuccess;