import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Filter, Clock, ExternalLink, AlertTriangle, CheckCircle, XCircle, RefreshCw, User, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { calculateSimilarityIndex } from "@/utils/similarityCalculator";

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

interface ThesisListProps {
  shouldRefresh?: boolean;
  onRefreshComplete?: () => void;
  sharedTheses?: Thesis[]; // Thêm prop để nhận dữ liệu từ component cha
  onThesesLoaded?: (theses: Thesis[]) => void; // Callback khi dữ liệu được tải
}

const ThesisList = ({ shouldRefresh, onRefreshComplete, sharedTheses, onThesesLoaded }: ThesisListProps) => {
  const { user } = useAuth();
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [dataFetched, setDataFetched] = useState(false);
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 30000; // 30 giây

  // Lấy danh sách luận văn từ API
  const fetchTheses = async (forceRefresh = false) => {
    // Nếu có dữ liệu từ component cha và không phải force refresh, sử dụng dữ liệu đó
    if (sharedTheses && !forceRefresh) {
      // Vẫn sử dụng utility function để tính toán
      const processedData = sharedTheses.map((thesis: Thesis) => {
        return calculateSimilarityIndex(thesis);
      });
      
      setTheses(processedData);
      setDataFetched(true);
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
      if (theses.length > 0) {
        if (onRefreshComplete) {
          onRefreshComplete();
        }
        return;
      }
    }

    setIsLoading(true);
    try {
      // Sử dụng tham số để kiểm soát việc sử dụng cache
      const { data } = await api.get('/theses', {
        params: {
          _skipCache: forceRefresh
        }
      });
      
      // Sử dụng utility function để tính toán Similarity Index
      const processedData = data.map((thesis: Thesis) => {
        return calculateSimilarityIndex(thesis);
      });
      
      setTheses(processedData);
      setDataFetched(true);
      lastFetchTime.current = now;
      
      // Gọi callback nếu có
      if (onThesesLoaded) {
        onThesesLoaded(processedData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách luận văn:", error);
      setTheses([]);
    } finally {
      setIsLoading(false);
      // Gọi callback khi hoàn tất làm mới
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchTheses(false);
    }
  }, [user]);

  // Cập nhật khi nhận dữ liệu từ props
  useEffect(() => {
    if (sharedTheses) {
      // Sử dụng utility function để tính toán
      const processedData = sharedTheses.map((thesis: Thesis) => {
        return calculateSimilarityIndex(thesis);
      });
      
      setTheses(processedData);
      setDataFetched(true);
      setIsLoading(false);
    }
  }, [sharedTheses]);

  // Theo dõi prop shouldRefresh để làm mới khi cần
  useEffect(() => {
    if (shouldRefresh && user) {
      fetchTheses(true); // Force refresh khi shouldRefresh = true
    }
  }, [shouldRefresh, user]);

  // Lọc và sắp xếp luận văn
  const filteredTheses = theses
    .filter(thesis => {
      // Lọc theo từ khóa tìm kiếm
      if (searchTerm && !thesis.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Lọc theo trạng thái
      if (statusFilter !== "all" && thesis.status !== statusFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sắp xếp theo thời gian
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } 
      // Sắp xếp theo điểm đạo văn (từ cao xuống thấp)
      else if (sortBy === "plagiarism") {
        return b.plagiarismScore - a.plagiarismScore;
      }
      
      return 0;
    });

  // Hiển thị skeleton loader khi đang tải
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        {Array(5).fill(0).map((_, index) => (
          <Card key={index} className="border border-dashed">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Hiển thị trạng thái trống
  if (dataFetched && theses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-bold tracking-tight mb-2">Chưa có luận văn nào</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Bạn chưa tải lên luận văn nào. Hãy tải lên luận văn đầu tiên để kiểm tra đạo văn.
        </p>
        <Button asChild>
          <Link to="/dashboard?tab=upload">
            <FileText className="mr-2 h-4 w-4" />
            Tải lên luận văn mới
          </Link>
        </Button>
      </motion.div>
    );
  }

  // Animation variants
  const listVariants = {
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
        duration: 0.3
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Đang xử lý
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Hoàn thành
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Từ chối
          </Badge>
        );
      default:
        return null;
    }
  };

  // Nếu đã tải dữ liệu thành công và có dữ liệu
  if (dataFetched && filteredTheses.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm luận văn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={sortBy} 
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="plagiarism">Tỷ lệ đạo văn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hiển thị số lượng kết quả */}
        <div className="text-sm text-muted-foreground">
          Tìm thấy {filteredTheses.length} luận văn
        </div>

        {/* Danh sách luận văn */}
        <AnimatePresence>
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4"
          >
            {filteredTheses.map((thesis) => (
              <motion.div key={thesis._id} variants={itemVariants}>
                <Card className="overflow-hidden transition-all hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-xl">
                        <Link 
                          to={`/thesis/${thesis._id}`} 
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {thesis.title}
                        </Link>
                      </CardTitle>
                      {getStatusBadge(thesis.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1 mb-2">
                      <Clock className="h-3 w-3" />
                      {new Date(thesis.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                    {(thesis.user?.name || thesis.faculty || (thesis.processingTime !== undefined && thesis.status === "completed")) && (
                      <CardDescription className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {thesis.user?.name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Tác giả: {thesis.user.name}
                          </span>
                        )}
                        {thesis.faculty && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Khoa: {thesis.faculty}
                          </span>
                        )}
                        {thesis.processingTime !== undefined && (thesis.status === "completed" || thesis.status === "rejected") && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Thời gian xử lý: {thesis.processingTime < 60 
                              ? `${thesis.processingTime} giây` 
                              : `${Math.floor(thesis.processingTime / 60)} phút ${thesis.processingTime % 60} giây`}
                          </span>
                        )}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {thesis.status === "completed" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Đạo văn truyền thống:</span>
                                <span className={`font-semibold ${
                                  thesis.plagiarismScore < 20 ? 'text-green-600' : 
                                  thesis.plagiarismScore < 40 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {thesis.plagiarismScore}%
                                </span>
                              </div>
                              <Progress 
                                value={thesis.plagiarismScore} 
                                className={`h-2 ${
                                  thesis.plagiarismScore < 20 ? 'bg-green-100' : 
                                  thesis.plagiarismScore < 40 ? 'bg-yellow-100' : 
                                  'bg-red-100'
                                }`}
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Đạo văn AI:</span>
                                <span className={`font-semibold ${
                                  thesis.aiPlagiarismScore < 20 ? 'text-green-600' : 
                                  thesis.aiPlagiarismScore < 40 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {thesis.aiPlagiarismScore}%
                                </span>
                              </div>
                              <Progress 
                                value={thesis.aiPlagiarismScore} 
                                className={`h-2 ${
                                  thesis.aiPlagiarismScore < 20 ? 'bg-green-100' : 
                                  thesis.aiPlagiarismScore < 40 ? 'bg-yellow-100' : 
                                  'bg-red-100'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 pb-2">
                    <div className="text-sm text-muted-foreground">
                      ID: {thesis._id.substring(0, 8)}...
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/thesis/${thesis._id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Nếu đã tải dữ liệu nhưng không có kết quả sau khi lọc
  return (
    <div className="text-center py-16">
      <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
      <h3 className="text-xl font-semibold mb-3">Chưa có luận văn nào</h3>
      <p className="text-muted-foreground mb-6">
        Bạn chưa có luận văn nào trong hệ thống. Hãy tải lên luận văn đầu tiên của bạn.
      </p>
      <Button 
        size="lg"
        className="px-4 py-2"
        onClick={() => {
          // Tìm component cha và thay đổi tab
          const tabChangeEvent = new CustomEvent('changeTab', { detail: { tab: 'upload' } });
          window.dispatchEvent(tabChangeEvent);
        }}
      >
        <FileText className="mr-2 h-5 w-5" />
        Tải lên luận văn
      </Button>
    </div>
  );
};

// Icon component for empty search results
const SearchIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
    <path d="M8 11h6" />
    <path d="M11 8v6" />
  </svg>
);

export default ThesisList;
