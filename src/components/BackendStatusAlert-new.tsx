import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const BackendStatusAlert = () => {
  const [isBackendDown, setIsBackendDown] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'warning'>('error');
  
  // Listen for API timeout events
  useEffect(() => {
    const handleApiTimeout = (event: any) => {
      const { url } = event.detail;
      setIsBackendDown(true);
      setIsVisible(true);
      setAlertType('warning');
      setStatusMessage(`API call to ${url} timed out. The server may be experiencing high load.`);
      
      // Keep visible for 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };
    
    window.addEventListener('api-timeout', handleApiTimeout as EventListener);
    return () => {
      window.removeEventListener('api-timeout', handleApiTimeout as EventListener);
    };
  }, []);

  // Check backend health periodically
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${api.defaults.baseURL}/health`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const wasDown = isBackendDown;
          setIsBackendDown(false);
          
          if (wasDown) {
            setAlertType('success');
            setStatusMessage('Đã kết nối lại đến máy chủ. Hệ thống hoạt động bình thường.');
            setIsVisible(true);
            
            try {
              // Check for pending notifications in localStorage
              const pendingNotifications = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
              if (pendingNotifications.length > 0) {
                console.log(`Trying to sync ${pendingNotifications.length} pending notifications with the backend`);
                
                // Attempt to send each notification
                for (const notification of pendingNotifications) {
                  // Remove local specific properties
                  const { _id, createdAt, ...notificationData } = notification;
                  
                  try {
                    await axios.request({
                      method: 'post',
                      baseURL: api.defaults.baseURL,
                      url: '/notifications',
                      data: notificationData,
                      timeout: 5000
                    });
                    console.log(`Successfully synced notification: ${notification.title}`);
                  } catch (err) {
                    console.error(`Failed to sync notification: ${notification.title}`, err);
                  }
                }
                
                // Clear the pending notifications
                localStorage.removeItem('pendingNotifications');
              }
            } catch (error) {
              console.error("Error syncing pending notifications:", error);
            }
            
            // Keep visible for a moment to show the "reconnected" message
            setTimeout(() => {
              setIsVisible(false);
            }, 3000);
          }
        } else {
          setIsBackendDown(true);
          setAlertType('error');
          setStatusMessage('Không thể kết nối đến máy chủ. Các tính năng của hệ thống có thể không hoạt động đúng.');
          setIsVisible(true);
        }
      } catch (error) {
        setIsBackendDown(true);
        setAlertType('error');
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          setStatusMessage('Máy chủ phản hồi quá chậm. Hệ thống có thể bị tắc nghẽn.');
        } else {
          setStatusMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
        }
        
        setIsVisible(true);
      }
    };

    // Check immediately on component mount
    checkBackendStatus();

    // Then check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, [isBackendDown]);

  // If not visible, don't render anything
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className={`max-w-xl mx-auto p-4 rounded-md shadow-lg flex items-start gap-3 ${
        alertType === 'error' 
          ? 'bg-destructive text-destructive-foreground' 
          : alertType === 'warning'
            ? 'bg-amber-500 text-white'
            : 'bg-green-500 text-white'
      }`}>
        <div className="flex-shrink-0 mt-0.5">
          {alertType === 'error' ? (
            <AlertCircle className="h-5 w-5" />
          ) : alertType === 'warning' ? (
            <Clock className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
        </div>
        
        <div>
          {alertType === 'error' ? (
            <>
              <h4 className="font-bold mb-1">Không thể kết nối đến máy chủ</h4>
              <p>{statusMessage}</p>
            </>
          ) : (
            <p className="font-medium">{statusMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendStatusAlert;
