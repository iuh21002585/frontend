import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const SeedData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seedActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API để tạo dữ liệu mẫu cho activities
      const response = await api.post('/api/activities/seed');
      
      setSuccess(true);
      toast({
        title: "Thành công",
        description: `Đã tạo ${response.data.count} hoạt động mẫu.`,
      });
    } catch (error) {
      console.error("Lỗi khi tạo dữ liệu mẫu:", error);
      setError("Không thể tạo dữ liệu mẫu. Vui lòng đảm bảo bạn đã đăng nhập với quyền admin.");
      toast({
        title: "Lỗi",
        description: "Không thể tạo dữ liệu mẫu. Kiểm tra console để biết thêm chi tiết.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Không có quyền truy cập</AlertTitle>
          <AlertDescription>
            Chỉ người dùng có quyền admin mới có thể truy cập trang này.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Tạo dữ liệu mẫu</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động hệ thống</CardTitle>
            <CardDescription>
              Tạo dữ liệu mẫu cho hoạt động hệ thống (activities) để hiển thị trên trang quản trị.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4">
                <Check className="h-4 w-4" />
                <AlertTitle>Thành công</AlertTitle>
                <AlertDescription>
                  Đã tạo dữ liệu mẫu cho hoạt động hệ thống.
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-gray-500 mb-4">
              Lưu ý: Thao tác này sẽ xóa tất cả dữ liệu hoạt động hiện có và tạo dữ liệu mẫu mới.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="default" 
              onClick={seedActivities}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo dữ liệu mẫu"
              )}
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/admin">Quay lại Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SeedData;
