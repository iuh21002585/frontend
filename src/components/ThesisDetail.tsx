import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, FileText, Download, Share2, Eye, Clock, User, Calendar, ArrowUpRight, BookOpen, BarChart, FileBarChart, Info, AlertOctagon, FileSearch, ListFilter, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ThesisProps = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  status: "pending" | "processing" | "completed" | "rejected";
  plagiarismScore?: number;
  aiPlagiarismScore?: number;
  fileUrl: string;
  fileSize: string;
  reportUrl?: string;
  abstract?: string;
  processingTime?: number;
  sources?: Array<{
    id: string;
    title: string;
    author: string;
    similarity: number;
    url: string;
  }>;
  textMatches?: Array<{
    id: string;
    sourceText: string;
    thesisText: string;
    similarity: number;
    source: {
      title: string;
      author: string;
      url: string;
    };
  }>;
  aiAnalysis?: string;
  aiTextMatches?: Array<{
    id: string;
    text: string;
    confidence: number;
    analysis: string;
  }>;
  aiReportUrl?: string;
};

interface ThesisDetailProps {
  thesis: ThesisProps;
  onClose: () => void;
}

const ThesisDetail = ({ thesis, onClose }: ThesisDetailProps) => {
  const [activeTab, setActiveTab] = useState("overview");

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-600 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <BarChart className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <AlertOctagon className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderPlagiarismBadge = () => {
    if (thesis.status !== "completed" || thesis.plagiarismScore === undefined) {
      return null;
    }

    let color = "bg-green-100 text-green-600 border-green-200";
    if (thesis.plagiarismScore > 30) {
      color = "bg-red-100 text-red-600 border-red-200";
    } else if (thesis.plagiarismScore > 10) {
      color = "bg-yellow-100 text-yellow-600 border-yellow-200";
    }

    return (
      <Badge className={`${color} ml-2`}>
        Đạo văn: {thesis.plagiarismScore}%
      </Badge>
    );
  };

  const renderAiPlagiarismBadge = () => {
    if (thesis.status !== "completed" || thesis.aiPlagiarismScore === undefined) {
      return null;
    }

    let color = "bg-green-100 text-green-600 border-green-200";
    if (thesis.aiPlagiarismScore > 30) {
      color = "bg-red-100 text-red-600 border-red-200";
    } else if (thesis.aiPlagiarismScore > 10) {
      color = "bg-yellow-100 text-yellow-600 border-yellow-200";
    }

    return (
      <Badge className={`${color} ml-2`}>
        Đạo văn AI: {thesis.aiPlagiarismScore}%
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
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
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight break-words pr-4">{thesis.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <Badge className={getStatusColor(thesis.status)}>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1">
                    {getStatusIcon(thesis.status)}
                    {thesis.status === "pending" && "Chờ xử lý"}
                    {thesis.status === "processing" && "Đang xử lý"}
                    {thesis.status === "completed" && "Hoàn thành"}
                    {thesis.status === "rejected" && "Bị từ chối"}
                  </span>
                  {thesis.processingTime !== undefined && (thesis.status === "completed" || thesis.status === "rejected") && (
                    <span className="text-xs mt-0.5">
                      {thesis.processingTime < 60 
                        ? `(${thesis.processingTime} giây)` 
                        : `(${Math.floor(thesis.processingTime / 60)} phút ${thesis.processingTime % 60} giây)`}
                    </span>
                  )}
                </div>
              </Badge>
              {renderPlagiarismBadge()}
              {renderAiPlagiarismBadge()}
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 h-auto gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
              <FileText className="h-4 w-4" />
              <span>Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2 py-2">
              <Eye className="h-4 w-4" />
              <span>Xem trước</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2 py-2">
              <FileBarChart className="h-4 w-4" />
              <span>Báo cáo chi tiết</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Thông tin chung</CardTitle>
                  <CardDescription>Thông tin chi tiết về luận văn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {thesis.abstract && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Tóm tắt</h3>
                      <p className="text-sm text-muted-foreground">
                        {thesis.abstract}
                      </p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Tác giả</span>
                      </div>
                      <p className="text-sm font-medium">{thesis.author}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Thời gian xử lý</span>
                      </div>
                      <p className="text-sm font-medium">
                        {thesis.processingTime !== undefined && (thesis.status === "completed" || thesis.status === "rejected") 
                          ? thesis.processingTime < 60 
                            ? `${thesis.processingTime} giây` 
                            : `${Math.floor(thesis.processingTime / 60)} phút ${thesis.processingTime % 60} giây`
                          : "Không có dữ liệu"
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Ngày tải lên</span>
                      </div>
                      <p className="text-sm font-medium">{formatDate(thesis.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Kích thước tệp</span>
                      </div>
                      <p className="text-sm font-medium">{thesis.fileSize}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loại tài liệu</span>
                      </div>
                      <p className="text-sm font-medium">Luận văn tốt nghiệp</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between flex-wrap gap-2">
                  <Button variant="outline" className="flex items-center gap-1" asChild>
                    <a href={thesis.fileUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      Tải xuống
                    </a>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      Chia sẻ
                    </Button>
                    <Button variant="outline" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Xem
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {thesis.status === "completed" && thesis.plagiarismScore !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>Kết quả kiểm tra đạo văn</CardTitle>
                    <CardDescription>Tỷ lệ đạo văn phát hiện được</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-muted stroke-current"
                            strokeWidth="10"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className={`${
                              thesis.plagiarismScore > 30
                                ? "text-red-500"
                                : thesis.plagiarismScore > 10
                                ? "text-yellow-500"
                                : "text-green-500"
                            } stroke-current`}
                            strokeWidth="10"
                            strokeDasharray={`${thesis.plagiarismScore * 2.5} 250`}
                            strokeLinecap="round"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-bold">{thesis.plagiarismScore}%</span>
                          <span className="text-sm text-muted-foreground">Đạo văn</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mức độ nguy hiểm</span>
                        <span className={`font-medium ${
                          thesis.plagiarismScore > 30
                            ? "text-red-500"
                            : thesis.plagiarismScore > 10
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}>
                          {thesis.plagiarismScore > 30
                            ? "Cao"
                            : thesis.plagiarismScore > 10
                            ? "Trung bình"
                            : "Thấp"}
                        </span>
                      </div>
                      <Progress value={thesis.plagiarismScore} 
                        className={`h-2 ${
                          thesis.plagiarismScore > 30
                            ? "bg-red-100"
                            : thesis.plagiarismScore > 10
                            ? "bg-yellow-100"
                            : "bg-green-100"
                        }`} 
                      />
                    </div>

                    {thesis.reportUrl && (
                      <div className="flex justify-center mt-6">
                        <Button asChild>
                          <a href={thesis.reportUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Tải xuống báo cáo đầy đủ
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Xem trước tài liệu</CardTitle>
                <CardDescription>
                  Xem trước nội dung của luận văn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] w-full border rounded-md flex items-center justify-center bg-muted/20">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-12 w-12" />
                    <p>Xem trước không khả dụng</p>
                    <Button variant="outline" className="mt-2" asChild>
                      <a href={thesis.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" />
                        Mở trong trình đọc
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo chi tiết</CardTitle>
                <CardDescription>
                  Thông tin chi tiết về kết quả kiểm tra đạo văn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {thesis.status === "completed" && (thesis.plagiarismScore !== undefined || thesis.aiPlagiarismScore !== undefined) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Đạo văn truyền thống - Bên trái */}
                    <div className="space-y-4 border-r pr-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Đạo văn truyền thống</h3>
                      </div>
                      
                      {thesis.plagiarismScore !== undefined ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-md border bg-slate-50">
                            <h3 className="font-medium mb-2">Tóm tắt kết quả</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tỷ lệ đạo văn phát hiện</span>
                                <span className="font-medium text-blue-600">{thesis.plagiarismScore}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Số nguồn trùng lặp</span>
                                <span className="font-medium">{thesis.sources?.length || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Thời gian kiểm tra</span>
                                <span className="font-medium">
                                  {thesis.processingTime ? (
                                    thesis.processingTime < 60 
                                      ? `${thesis.processingTime} giây` 
                                      : `${Math.floor(thesis.processingTime / 60)} phút ${thesis.processingTime % 60} giây`
                                  ) : "Không có dữ liệu"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Các nguồn trùng lặp chính</h3>
                            <div className="space-y-3">
                              {thesis.sources?.map((item, index) => (
                                <div key={index} className="p-3 rounded-md border">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">{item.title}</span>
                                    <Badge variant="outline">{item.similarity}%</Badge>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Nguồn</span>
                                    <a 
                                      href={item.url} 
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Xem nguồn
                                      <ArrowUpRight className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Các đoạn văn trùng lặp chính</h3>
                            <div className="space-y-3">
                              {thesis.textMatches?.map((item, index) => (
                                <div key={index} className="p-3 rounded-md border">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">{item.source.title}</span>
                                    <Badge variant="outline">{item.similarity}%</Badge>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Nguồn</span>
                                    <a 
                                      href={item.source.url} 
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Xem nguồn
                                      <ArrowUpRight className="h-3 w-3" />
                                    </a>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Văn bản nguồn:</p>
                                    <p className="text-sm">{item.sourceText}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Văn bản luận văn:</p>
                                    <p className="text-sm">{item.thesisText}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {thesis.reportUrl && (
                            <div className="flex justify-center mt-6">
                              <Button asChild size="sm">
                                <a href={thesis.reportUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" />
                                  Tải xuống báo cáo đầy đủ
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-[300px] w-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                          <AlertCircle className="h-12 w-12" />
                          <div className="text-center">
                            <p className="mb-1">Báo cáo chưa sẵn sàng</p>
                            <p className="text-sm">Kiểm tra đạo văn truyền thống chưa được thực hiện.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Đạo văn AI - Bên phải */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <Cpu className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Đạo văn AI</h3>
                      </div>
                      
                      {thesis.aiPlagiarismScore !== undefined ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-md border bg-slate-50">
                            <h3 className="font-medium mb-2">Tóm tắt kết quả AI</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tỷ lệ đạo văn AI phát hiện</span>
                                <span className="font-medium text-purple-600">{thesis.aiPlagiarismScore}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Độ tin cậy</span>
                                <span className="font-medium">
                                  {thesis.aiPlagiarismScore < 30 ? "Cao" : 
                                   thesis.aiPlagiarismScore < 60 ? "Trung bình" : "Thấp"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Thời gian kiểm tra</span>
                                <span className="font-medium">
                                  {thesis.processingTime ? (
                                    thesis.processingTime < 60 
                                      ? `${thesis.processingTime} giây` 
                                      : `${Math.floor(thesis.processingTime / 60)} phút ${thesis.processingTime % 60} giây`
                                  ) : "Không có dữ liệu"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Đánh giá AI</h3>
                            <div className="p-4 rounded-md border bg-slate-50">
                              <p className="text-sm">
                                {thesis.aiAnalysis || "Hệ thống AI đã phân tích nội dung luận văn và đánh giá mức độ đạo văn dựa trên các mẫu văn bản được tạo ra bởi AI. Dựa trên kết quả phân tích, luận văn của bạn có tỷ lệ đạo văn AI là " + thesis.aiPlagiarismScore + "%."}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Các đoạn văn có khả năng được tạo bởi AI</h3>
                            <div className="space-y-3">
                              {thesis.aiTextMatches?.map((item, index) => (
                                <div key={index} className="p-3 rounded-md border">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">Đoạn văn {index + 1}</span>
                                    <Badge variant="outline">{item.confidence}% khả năng AI</Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Nội dung:</p>
                                    <p className="text-sm">{item.text}</p>
                                  </div>
                                  <div className="space-y-1 mt-2">
                                    <p className="text-sm text-muted-foreground">Nhận xét:</p>
                                    <p className="text-sm">{item.analysis}</p>
                                  </div>
                                </div>
                              )) || (
                                <div className="p-3 rounded-md border text-center text-muted-foreground">
                                  <p>Không tìm thấy đoạn văn nào có khả năng được tạo bởi AI.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {thesis.aiReportUrl && (
                            <div className="flex justify-center mt-6">
                              <Button asChild size="sm">
                                <a href={thesis.aiReportUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" />
                                  Tải xuống báo cáo AI đầy đủ
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-[300px] w-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                          <Cpu className="h-12 w-12" />
                          <div className="text-center">
                            <p className="mb-1">Báo cáo AI chưa sẵn sàng</p>
                            <p className="text-sm">Kiểm tra đạo văn AI chưa được thực hiện.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] w-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <AlertCircle className="h-12 w-12" />
                    <div className="text-center">
                      <p className="mb-1">Báo cáo chưa sẵn sàng</p>
                      <p className="text-sm">Luận văn của bạn chưa được kiểm tra hoặc đang trong quá trình kiểm tra.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default ThesisDetail;
