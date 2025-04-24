import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BarChart, FileText, Users, Server, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import AdminUserManagement from "@/components/AdminUserManagement";
import AdminThesisList from "@/components/AdminThesisList";
import AdminConfig from "@/components/AdminConfig";
import UserActivityList from "@/components/UserActivityList";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  BookOpen, 
  Users as UsersIcon, 
  FileBarChart, 
  Server as ServerIcon,
  Shield,
  AlertTriangle as AlertTriangleIcon,
  GraduationCap,
  Activity,
  UserCog,
  Settings,
  Bell
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Upload, User, CheckCircle, Trash2, Edit, CheckCheck } from "lucide-react";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTheses: 0,
    rejectedTheses: 0,
    completedTheses: 0,
    totalUsers: 0,
    averagePlagiarismScore: 0,
    systemUsage: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    _id?: string,
    id?: number,
    action: string,
    details: string,
    time: string,
    date?: string,
    type: string
  }>>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setIsLoading(true);
        
        // Lấy thống kê người dùng từ API users
        const userStatsResponse = await api.get('/users/admin/stats');
        const userStats = userStatsResponse.data;
        
        // Lấy thống kê về luận văn
        const thesisStatsResponse = await api.get('/theses/stats');
        const thesisStats = thesisStatsResponse.data;
        
        // Kết hợp các thống kê
        setStats({
          totalTheses: thesisStats.totalTheses || 0,
          rejectedTheses: thesisStats.rejectedTheses || 0,
          completedTheses: thesisStats.completedTheses || 0,
          totalUsers: userStats.totalUsers || 0,
          averagePlagiarismScore: thesisStats.averagePlagiarismScore || 0,
          systemUsage: 0
        });
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
        // Khởi tạo dữ liệu trống
        setStats({
          totalTheses: 0,
          rejectedTheses: 0,
          completedTheses: 0,
          totalUsers: 0,
          averagePlagiarismScore: 0,
          systemUsage: 0
        });
        toast({
          title: "Lỗi dữ liệu",
          description: "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        setActivitiesLoading(true);
        // Gọi API lấy hoạt động gần đây
        try {
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
            
          setRecentActivity(sortedActivities);
        } catch (apiError) {
          console.log("API trả về lỗi:", apiError);
          setRecentActivity([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy hoạt động gần đây:", error);
        // Đặt mảng rỗng
        setRecentActivity([]);
        toast({
          title: "Lỗi dữ liệu",
          description: "Không thể tải hoạt động gần đây. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setActivitiesLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchAdminStats();
      fetchRecentActivity();
    }
  }, [user, toast]);

  if (!user || !user.isAdmin) {
    return null;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  // Helper function to get icons for activity types
  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <User className="h-4 w-4 text-green-500" />;
      case 'check':
        return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'edit':
        return <Edit className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="flex flex-col space-y-2" variants={itemVariants}>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Trang quản trị</h2>
        </div>
        <p className="text-muted-foreground">
          Quản lý tất cả luận văn, người dùng và cài đặt hệ thống
        </p>
      </motion.div>

      {/* Dashboard Stats */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" variants={itemVariants}>
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Tổng luận văn</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTheses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tất cả luận văn trong hệ thống
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Không đạt yêu cầu</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedTheses || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Luận văn không đạt tiêu chuẩn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Đạt yêu cầu</CardTitle>
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTheses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Luận văn đạt tiêu chuẩn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng số người dùng trên hệ thống
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
              <FileBarChart className="h-4 w-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="config" onClick={() => setActiveTab("config")}>
              <Settings className="h-4 w-4 mr-2" />
              Ngưỡng đạo văn
            </TabsTrigger>
            <TabsTrigger value="theses" onClick={() => setActiveTab("theses")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Luận văn
            </TabsTrigger>
            <TabsTrigger value="users" onClick={() => setActiveTab("users")}>
              <UserCog className="h-4 w-4 mr-2" />
              Người dùng
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                  <CardDescription>
                    Thông báo về đăng ký tài khoản mới và luận văn mới
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserActivityList />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Theses Management Tab */}
          <TabsContent value="theses">
            <Card>
              <CardHeader>
                <CardTitle>Tất cả luận văn</CardTitle>
                <CardDescription>
                  Quản lý tất cả luận văn đã được tải lên hệ thống.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminThesisList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          {/* Config Management Tab */}
          <TabsContent value="config">
            <AdminConfig />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
