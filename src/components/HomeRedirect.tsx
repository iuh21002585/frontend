import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Component này kiểm tra xem người dùng đã đăng nhập hay chưa.
 * Nếu đã đăng nhập, sẽ chuyển hướng đến trang dashboard.
 * Nếu chưa đăng nhập, sẽ hiển thị nội dung trang chủ bình thường (children).
 */
const HomeRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu đã đăng nhập và không đang tải, chuyển hướng đến dashboard
    if (user && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Nếu đang tải, hiển thị trạng thái tải
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị trang chủ bình thường
  if (!user) {
    return <>{children}</>;
  }

  // Đang trong quá trình chuyển hướng, hiển thị trạng thái tải
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default HomeRedirect;
