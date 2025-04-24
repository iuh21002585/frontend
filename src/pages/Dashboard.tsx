import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import UploadThesis from "@/components/UploadThesis";
import ThesisList from "@/components/ThesisList";
import Statistics from "@/components/Statistics";
import { 
  BookOpen, 
  Upload, 
  FileBarChart, 
  Settings, 
  User as UserIcon,
  PieChart, 
  Eye as EyeIcon,
  FileSearch as FileSearchIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText as FileTextIcon, CalendarCheck, Users as UsersIcon, Upload as UploadIcon, Clock as ClockIcon } from "lucide-react";
import { formatDistance } from "date-fns";
import api from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";

// Interface cho kiểu dữ liệu thống kê
interface StatisticData {
  totalTheses: number;
  pendingTheses: number;
  processingTheses: number;
  completedTheses: number;
  rejectedTheses: number;
  avgPlagiarismScore: number;
  avgAiPlagiarismScore: number;
  timeData: number[];
  timeLabels: string[];
  traditionalPlagiarismScore?: number;
  aiPlagiarismScore?: number;
  [key: string]: any;
}

// Interface cho kiểu dữ liệu luận văn
interface Thesis {
  _id: string;
  title: string;
  createdAt: string;
  status: "processing" | "completed" | "rejected";
  plagiarismScore: number;
  aiPlagiarismScore: number;
  processingTime?: number;
  faculty?: string;
  user?: {
    name: string;
  };
  textMatches?: any[];
  aiGeneratedScore?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Thiết lập tab active từ URL query param hoặc mặc định là 'upload'
  const urlParams = new URLSearchParams(location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "upload");

  // State để lưu trữ dữ liệu
  const [stats, setStats] = useState<StatisticData | null>(null);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [activities, setActivities] = useState([]);
  
  // State loading
  const [statsLoading, setStatsLoading] = useState(true);
  const [thesesLoading, setThesesLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  
  // State để theo dõi trạng thái làm mới
  const [shouldRefreshStats, setShouldRefreshStats] = useState(false);
  const [shouldRefreshTheses, setShouldRefreshTheses] = useState(false);
  const [hasStats, setHasStats] = useState(false);
  const [hasTheses, setHasTheses] = useState(false);

  // Cập nhật URL khi tab thay đổi
  const updateTabInUrl = (tab: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // Handler cho sự kiện chuyển tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateTabInUrl(value);
  };

  // Hàm lấy thống kê từ API
  const fetchStats = useCallback(async (forceRefresh = false) => {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/theses/stats', {
        params: { _skipCache: forceRefresh }
      });
      
      setStats(data);
      setHasStats(data && data.totalTheses > 0);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      setStats(null);
      setHasStats(false);
    } finally {
      setStatsLoading(false);
      setShouldRefreshStats(false);
    }
  }, []);
  
  // Hàm lấy danh sách luận văn từ API
  const fetchTheses = useCallback(async (forceRefresh = false) => {
    setThesesLoading(true);
    try {
      const { data } = await api.get('/theses', {
        params: { _skipCache: forceRefresh }
      });
      
      setTheses(data);
      setHasTheses(data && data.length > 0);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách luận văn:", error);
      setTheses([]);
      setHasTheses(false);
    } finally {
      setThesesLoading(false);
      setShouldRefreshTheses(false);
    }
  }, []);
  
  // Hàm lấy hoạt động gần đây từ API (chỉ cho admin)
  const fetchActivities = useCallback(async () => {
    if (!user?.isAdmin) {
      setActivitiesLoading(false);
      return;
    }
    
    setActivitiesLoading(true);
    try {
      // Tạm mock data activities
      const mockActivities = [
        {
          _id: '1',
          action: 'Tạo luận văn',
          description: 'Nguyễn Văn A đã tải lên luận văn mới - "Nghiên cứu về AI"',
          createdAt: new Date().toISOString(),
          user: { name: 'Nguyễn Văn A' }
        },
        {
          _id: '2',
          action: 'Kiểm tra hoàn tất',
          description: 'Trần Thị B đã tải lên luận văn - "Phát triển phần mềm"',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          user: { name: 'Trần Thị B' }
        }
      ];
      setActivities(mockActivities);
      /*
      const { data } = await api.get('/activities');
      setActivities(data);
      */
    } catch (error) {
      console.error("Lỗi khi lấy hoạt động gần đây:", error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, [user]);

  // Hàm xử lý refresh tất cả dữ liệu
  const refreshAllData = useCallback(() => {
    fetchStats(true);
    fetchTheses(true);
    fetchActivities();
  }, [fetchStats, fetchTheses, fetchActivities]);

  // Hook effect cho việc tải dữ liệu ban đầu
  useEffect(() => {
    if (user) {
      fetchStats(false);
      fetchTheses(false);
      fetchActivities();
    }
  }, [user, fetchStats, fetchTheses, fetchActivities]);

  // Hook effect cho việc làm mới dữ liệu khi cần
  useEffect(() => {
    if (shouldRefreshStats) {
      fetchStats(true);
    }
  }, [shouldRefreshStats, fetchStats]);

  useEffect(() => {
    if (shouldRefreshTheses) {
      fetchTheses(true);
    }
  }, [shouldRefreshTheses, fetchTheses]);

  // Lắng nghe sự kiện thay đổi tab từ các component con
  useEffect(() => {
    const handleTabChangeEvent = (event: CustomEvent) => {
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
        updateTabInUrl(event.detail.tab);
      }
    };

    // Định nghĩa kiểu cho event
    window.addEventListener("changeTab", handleTabChangeEvent as EventListener);

    return () => {
      window.removeEventListener("changeTab", handleTabChangeEvent as EventListener);
    };
  }, [location.pathname]);

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  if (!user) {
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

  // Xử lý khi tải lên luận văn thành công
  const handleUploadSuccess = () => {
    // Làm mới toàn bộ dữ liệu
    refreshAllData();
    // Chuyển về tab danh sách luận văn
    setActiveTab("myTheses");
    updateTabInUrl("myTheses");
    
    // Hiển thị thông báo thành công
    toast({
      title: "Tải lên thành công",
      description: "Luận văn của bạn đã được tải lên thành công và đang được kiểm tra.",
      duration: 5000,
    });
  };

  return (
    <motion.div 
      className="space-y-6 container mx-auto px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="flex flex-col space-y-2 mx-auto max-w-6xl w-full" variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight">Xin chào, {user.name}!</h2>
        <p className="text-muted-foreground">
          Quản lý và kiểm tra đạo văn cho các luận văn của bạn
        </p>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants} className="mx-auto max-w-6xl w-full">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 h-auto gap-2">
            <TabsTrigger value="upload" className="flex items-center gap-2 py-2">
              <UploadIcon className="h-4 w-4" />
              <span>Tải lên luận văn</span>
            </TabsTrigger>
            <TabsTrigger value="myTheses" className="flex items-center gap-2 py-2">
              <BookOpen className="h-4 w-4" />
              <span>Luận văn của tôi</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
              <FileBarChart className="h-4 w-4" />
              <span>Tổng quan</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Phần Hoạt động gần đây - chỉ hiển thị cho Admin */}
              {user?.isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hoạt động gần đây</CardTitle>
                    <CardDescription>
                      Hoạt động của người dùng trong hệ thống
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {activitiesLoading ? (
                          // Hiển thị skeleton khi đang tải
                          Array(3).fill(0).map((_, index) => (
                            <Skeleton key={index} className="h-20 w-full" />
                          ))
                        ) : activities.length === 0 ? (
                          // Hiển thị tin nhắn khi không có hoạt động
                          <div className="flex flex-col items-center justify-center py-10">
                            <ClockIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Chưa có hoạt động nào gần đây
                            </p>
                          </div>
                        ) : (
                          // Hiển thị danh sách hoạt động
                          activities.map((activity) => (
                            <div 
                              key={activity._id || activity.id}
                              className="border rounded-md p-3"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{activity.title || activity.action}</p>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </p>
                              <div className="text-xs text-muted-foreground mt-2">
                                {formatDistance(new Date(activity.createdAt || activity.date), new Date(), {
                                  addSuffix: true
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Thêm component Statistics vào tab Tổng quan */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê chi tiết</CardTitle>
                <CardDescription>
                  Phân tích chi tiết về các luận văn của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Statistics 
                  shouldRefresh={shouldRefreshStats}
                  onRefreshComplete={() => setShouldRefreshStats(false)}
                  sharedStats={stats as StatisticData}
                  onStatsLoaded={(updatedStats) => setStats(updatedStats as StatisticData)}
                />
                {!hasStats && !statsLoading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <FileTextIcon className="h-16 w-16 text-muted-foreground mb-6" />
                    <h3 className="text-2xl font-semibold mb-3">Chưa có luận văn nào</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      Bạn cần tải lên ít nhất một luận văn để xem thống kê tổng quan.
                      Các thông tin thống kê sẽ hiển thị sau khi có dữ liệu.
                    </p>
                    <Button 
                      onClick={() => handleTabChange("upload")}
                      size="lg"
                      className="px-4 py-2"
                    >
                      <UploadIcon className="mr-2 h-5 w-5" />
                      Tải lên luận văn
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Theses Tab */}
          <TabsContent value="myTheses">
            <Card>
              <CardHeader>
                <CardTitle>Luận văn của tôi</CardTitle>
                <CardDescription>
                  Danh sách các luận văn bạn đã tải lên và trạng thái của chúng.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThesisList 
                  shouldRefresh={shouldRefreshTheses}
                  onRefreshComplete={() => setShouldRefreshTheses(false)}
                  sharedTheses={theses}
                  onThesesLoaded={(updatedTheses) => setTheses(updatedTheses)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <UploadThesis onUploadSuccess={handleUploadSuccess} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
