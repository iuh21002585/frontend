import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Users, 
  FileText, 
  Calendar, 
  BarChart2, 
  LineChart as LineChartIcon,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

// Kiểu dữ liệu thống kê
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
  // Các trường cũ cho mục đích tương thích
  totalChecked?: number;
  totalPending?: number;
  averagePlagiarismScore?: number;
  averageAiPlagiarismScore?: number;
  monthlySubmissions?: { name: string; count: number }[];
}

interface StatisticsProps {
  shouldRefresh?: boolean;
  onRefreshComplete?: () => void;
  sharedStats?: StatisticData; // Thêm prop để nhận dữ liệu từ component cha
  onStatsLoaded?: (stats: StatisticData) => void; // Callback khi dữ liệu được tải
}

// Màu sắc cho biểu đồ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4CAF50', '#FF5252'];

const Statistics = ({ shouldRefresh, onRefreshComplete, sharedStats, onStatsLoaded }: StatisticsProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticData | null>(null);
  const [timeRange, setTimeRange] = useState("month");
  const [chartType, setChartType] = useState("bar");
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 30000; // 30 giây

  const fetchStatistics = async (forceRefresh = false) => {
    // Nếu có dữ liệu chia sẻ từ component cha, sử dụng dữ liệu đó
    if (sharedStats && !forceRefresh) {
      setStatistics(sharedStats);
      setIsLoading(false);
      if (onRefreshComplete) {
        onRefreshComplete();
      }
      return;
    }

    // Nếu chưa đến thời gian làm mới và không phải force refresh, không gọi API
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime.current < minFetchInterval) {
      // Nếu đã có dữ liệu, không cần loading state
      if (statistics) {
        if (onRefreshComplete) {
          onRefreshComplete();
        }
        return;
      }
    }

    setIsLoading(true);
    try {
      // Gọi API thống kê với tham số để sử dụng cache nếu không phải force refresh
      const { data } = await api.get('/theses/stats', {
        params: {
          timeRange,
          _skipCache: forceRefresh
        }
      });
      
      // Chuyển đổi dữ liệu từ API sang định dạng cần thiết
      const statsData: StatisticData = {
        totalTheses: data.totalTheses || 0,
        pendingTheses: data.pendingTheses || 0,
        processingTheses: data.processingTheses || 0,
        completedTheses: data.completedTheses || 0,
        rejectedTheses: data.rejectedTheses || 0,
        avgPlagiarismScore: data.avgPlagiarismScore || 0,
        avgAiPlagiarismScore: data.avgAiPlagiarismScore || 0,
        timeData: data.timeData || [],
        timeLabels: data.timeLabels || [],
        
        // Chuyển đổi cho phần hiển thị
        totalChecked: data.completedTheses + data.rejectedTheses,
        totalPending: data.pendingTheses + data.processingTheses,
        averagePlagiarismScore: data.traditionalPlagiarismScore || 0,
        averageAiPlagiarismScore: data.aiPlagiarismScore || 0,
        
        // Tạo dữ liệu nộp theo tháng từ dữ liệu thời gian
        monthlySubmissions: data.timeLabels.map((label: string, index: number) => ({
          name: label,
          count: data.timeData[index] || 0
        }))
      };
      
      setStatistics(statsData);
      lastFetchTime.current = now;
      
      // Gọi callback nếu có
      if (onStatsLoaded) {
        onStatsLoaded(statsData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      
      // Nếu API lỗi, tạo dữ liệu mẫu trống để hiển thị thông báo không có luận văn
      const emptyStats = {
        totalTheses: 0,
        pendingTheses: 0,
        processingTheses: 0,
        completedTheses: 0,
        rejectedTheses: 0,
        avgPlagiarismScore: 0,
        avgAiPlagiarismScore: 0,
        timeData: [],
        timeLabels: [],
        totalChecked: 0,
        totalPending: 0,
        averagePlagiarismScore: 0,
        averageAiPlagiarismScore: 0,
        monthlySubmissions: []
      };
      
      setStatistics(emptyStats);
      
      // Gọi callback với dữ liệu rỗng nếu có
      if (onStatsLoaded) {
        onStatsLoaded(emptyStats);
      }
    } finally {
      setIsLoading(false);
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchStatistics(false);
    }
  }, [user, timeRange]);
  
  // Theo dõi prop shouldRefresh để làm mới khi cần
  useEffect(() => {
    if (shouldRefresh && user) {
      fetchStatistics(true); // Force refresh khi shouldRefresh = true
    }
  }, [shouldRefresh, user]);

  // Cập nhật khi nhận dữ liệu từ props
  useEffect(() => {
    if (sharedStats) {
      setStatistics(sharedStats);
      setIsLoading(false);
    }
  }, [sharedStats]);

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

  // Hiển thị skeleton loader khi đang tải
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(5).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        
        <Skeleton className="h-[300px] w-full rounded-lg" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(2).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-[250px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Kiểm tra nếu không có dữ liệu thống kê
  if (!statistics) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Không có dữ liệu</h3>
        <p className="text-muted-foreground">
          Không thể tải thông tin thống kê. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  // Kiểm tra nếu không có luận văn nào
  if (statistics.totalTheses === 0) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold tracking-tight">Thống kê</h2>
          <p className="text-muted-foreground">
            Phân tích tổng quan về các luận văn đã kiểm tra
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex items-center gap-2 mt-2 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Cards thống kê */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số luận văn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{statistics.totalTheses}</div>
              <FileText className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tất cả tài liệu trong hệ thống
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đạt yêu cầu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{statistics.completedTheses}</div>
              <div className="flex items-center text-green-500">
                <TrendingDown className="h-8 w-8 opacity-80" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Theo tỉ lệ đạo văn Admin đặt ra
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Không đạt yêu cầu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{statistics.totalTheses - statistics.completedTheses}</div>
              <div className="flex items-center text-red-500">
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Theo tỉ lệ đạo văn Admin đặt ra
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tỷ lệ đạo văn truyền thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{(statistics.averagePlagiarismScore || 0).toFixed(1)}%</div>
              <div className="flex items-center text-amber-500">
                <TrendingDown className="h-8 w-8 opacity-80" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trung bình tất cả luận văn
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tỷ lệ đạo văn AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{(statistics.averageAiPlagiarismScore || 0).toFixed(1)}%</div>
              <div className="flex items-center text-purple-500">
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trung bình tất cả luận văn
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Biểu đồ số lượng luận văn theo tháng */}
      <Tabs defaultValue="bar" className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Số lượng luận văn theo tháng</h3>
          <TabsList>
            <TabsTrigger value="bar" onClick={() => setChartType("bar")}>
              <BarChart2 className="h-4 w-4 mr-2" />
              Cột
            </TabsTrigger>
            <TabsTrigger value="line" onClick={() => setChartType("line")}>
              <LineChartIcon className="h-4 w-4 mr-2" />
              Đường
            </TabsTrigger>
          </TabsList>
        </div>
        
        <motion.div 
          variants={itemVariants}
          className="rounded-lg border bg-card p-4 md:p-6"
        >
          <TabsContent value="bar" className="mt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={statistics.monthlySubmissions}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Số lượng" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="line" className="mt-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={statistics.monthlySubmissions}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Số lượng"
                  stroke="#0088FE" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default Statistics;
