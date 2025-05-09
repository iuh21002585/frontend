import { useEffect, useState } from 'react';
import api from '@/lib/api';

export const BackendStatusAlert = () => {
  const [isBackendDown, setIsBackendDown] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Check backend health periodically
  useEffect(() => {
    const checkBackendStatus = async () => {
      const result = await api.healthCheck();
      if (result.status === 'down') {
        setIsBackendDown(true);
        setIsVisible(true);
      } else {
        setIsBackendDown(false);
        // Keep visible for a moment to show the "reconnected" message
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    };

    // Check immediately on component mount
    checkBackendStatus();

    // Then check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // If backend is fine and we're not showing any message, don't render anything
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className={`max-w-xl mx-auto p-4 rounded-md shadow-lg ${
        isBackendDown 
          ? 'bg-destructive text-destructive-foreground' 
          : 'bg-green-500 text-white'
      }`}>
        {isBackendDown ? (
          <>
            <h4 className="font-bold mb-1">Không thể kết nối đến máy chủ</h4>
            <p>
              Các tính năng của hệ thống có thể không hoạt động đúng. 
              Chúng tôi đang cố gắng kết nối lại. Vui lòng thử lại sau.
            </p>
          </>
        ) : (
          <p className="font-medium">Đã kết nối lại đến máy chủ. Hệ thống hoạt động bình thường.</p>
        )}
      </div>
    </div>
  );
};

export default BackendStatusAlert;