import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { 
  Bell, 
  Upload, 
  User, 
  CheckCircle, 
  Trash2, 
  Edit, 
  CheckCheck, 
  FileText, 
  BookOpen,
  Shield
} from "lucide-react";

interface Activity {
  _id: string;
  action: string;
  details: string;
  time: string;
  type: string;
}

const UserActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserActivities();
  }, []);
  


  const fetchUserActivities = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/activities?limit=20');
      
      // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
      const formattedActivities = Array.isArray(data) ? 
        data.map(activity => ({
          _id: activity._id,
          action: activity.action,
          details: activity.description,
          time: new Date(activity.createdAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: activity.entityType
        })) : [];
      
      // Sắp xếp hoạt động theo thời gian mới nhất
      const sortedActivities = [...formattedActivities].sort((a, b) => {
        const dateA = new Date(a.time || 0);
        const dateB = new Date(b.time || 0);
        return dateB.getTime() - dateA.getTime();
      });
        
      setActivities(sortedActivities);
    } catch (error) {
      console.error("Lỗi khi lấy hoạt động người dùng:", error);
      setActivities([]);
      toast({
        title: "Lỗi dữ liệu",
        description: "Không thể tải hoạt động người dùng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get icons for activity types
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'thesis':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Shield className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Tạo dữ liệu mẫu nếu không có dữ liệu từ API
  const seedSampleActivities = () => {
    const sampleActivities = [
      {
        _id: "1",
        action: "Tải lên luận văn mới",
        details: "Luận văn về trí tuệ nhân tạo đã được tải lên",
        time: new Date().toLocaleString('vi-VN'),
        type: "thesis"
      },
      {
        _id: "2",
        action: "Đăng ký người dùng mới",
        details: "Giảng viên mới đã tham gia hệ thống",
        time: new Date(Date.now() - 86400000).toLocaleString('vi-VN'),
        type: "user"
      },
      {
        _id: "3",
        action: "Kiểm tra đạo văn hoàn tất",
        details: "Kết quả: 15% nội dung trùng lặp",
        time: new Date(Date.now() - 172800000).toLocaleString('vi-VN'),
        type: "thesis"
      },
      {
        _id: "4",
        action: "Cấu hình hệ thống",
        details: "Cập nhật cấu hình hệ thống kiểm tra đạo văn",
        time: new Date(Date.now() - 259200000).toLocaleString('vi-VN'),
        type: "system"
      },
      {
        _id: "5",
        action: "Xóa luận văn",
        details: "Đã xóa luận văn không hợp lệ",
        time: new Date(Date.now() - 345600000).toLocaleString('vi-VN'),
        type: "thesis"
      },
      {
        _id: "6",
        action: "Cập nhật quyền người dùng",
        details: "Đã cấp quyền quản trị viên cho người dùng",
        time: new Date(Date.now() - 432000000).toLocaleString('vi-VN'),
        type: "user"
      }
    ];
    
    setActivities(sampleActivities);
    setIsLoading(false);
    
    toast({
      title: "Đã tạo dữ liệu mẫu",
      description: "Hiển thị dữ liệu hoạt động mẫu do không có dữ liệu thực.",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>
          Thông báo về đăng ký tài khoản mới và luận văn mới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item, index) => (
                <div key={index} className="border rounded-md p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                    <div className="flex-grow">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chưa có hoạt động nào</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={seedSampleActivities}
                  >
                    Tạo dữ liệu mẫu
                  </Button>
                </div>
              ) : (
                <>
                  {/* Hiển thị 5 hoạt động mới nhất hoặc tất cả nếu đã chọn xem thêm */}
                  {(showAllActivities ? activities : activities.slice(0, 5)).map((activity) => (
                    <div 
                      key={activity._id}
                      className="border rounded-md p-4 flex gap-4 items-start"
                    >
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <p className="font-medium">{activity.action}</p>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Nút Xem thêm */}
                  {!isLoading && activities.length > 5 && !showAllActivities && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => setShowAllActivities(true)}
                    >
                      Xem thêm hoạt động
                    </Button>
                  )}
                  
                  {/* Nút Thu gọn */}
                  {!isLoading && showAllActivities && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => setShowAllActivities(false)}
                    >
                      Thu gọn
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserActivityList;
