import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle, XCircle, FileText, Clock } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface Thesis {
  _id: string;
  title: string;
  author: string;
  faculty: string;
  createdAt: string;
  status: "processing" | "completed" | "rejected";
  plagiarismScore: number;
  aiPlagiarismScore: number;
  processingTime?: number;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

const AdminThesisList = () => {
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataFetched, setDataFetched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Gọi API để lấy dữ liệu thực
    const fetchTheses = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/theses/all');
        setTheses(data);
        setDataFetched(true);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách luận văn:", error);
        setTheses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTheses();
  }, []);

  const handleDeleteThesis = async (id: string) => {
    try {
      await api.delete(`/theses/${id}`);
      
      // Cập nhật danh sách sau khi xóa
      setTheses((prev) => prev.filter((thesis) => thesis._id !== id));
      
      toast({
        title: "Xóa thành công",
        description: "Luận văn đã được xóa khỏi hệ thống",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa luận văn",
      });
    }
  };

  const handleApproveThesis = async (id: string) => {
    try {
      await api.patch(`/theses/${id}/approve`);
      
      // Cập nhật trạng thái luận văn
      setTheses((prev) =>
        prev.map((thesis) =>
          thesis._id === id ? { ...thesis, status: "completed" as const } : thesis
        )
      );
      
      toast({
        title: "Phê duyệt thành công",
        description: "Luận văn đã được phê duyệt",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi phê duyệt luận văn",
      });
    }
  };

  const handleRejectThesis = async (id: string) => {
    try {
      await api.patch(`/theses/${id}/reject`);
      
      // Cập nhật trạng thái luận văn
      setTheses((prev) =>
        prev.map((thesis) =>
          thesis._id === id ? { ...thesis, status: "rejected" as const } : thesis
        )
      );
      
      toast({
        title: "Từ chối thành công",
        description: "Luận văn đã bị từ chối",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi từ chối luận văn",
      });
    }
  };

  const filteredTheses = theses.filter(
    (thesis) =>
      thesis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thesis.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thesis.faculty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="space-y-2">
          {Array(5).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Hiển thị trạng thái trống khi không có dữ liệu
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
          Hiện chưa có luận văn nào trong hệ thống.
        </p>
      </motion.div>
    );
  }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Tìm kiếm theo tiêu đề, tác giả, khoa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          Tổng số: {filteredTheses.length} luận văn
        </div>
      </div>

      {filteredTheses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Không tìm thấy luận văn nào phù hợp với từ khóa tìm kiếm
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Khoa</TableHead>
              <TableHead>Ngày tải lên</TableHead>
              <TableHead>Thời gian xử lý</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tỷ lệ đạo văn (Truyền thống/AI)</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTheses.map((thesis) => (
              <TableRow key={thesis._id}>
                <TableCell className="font-medium">{thesis.title}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{thesis.author}</span>
                    <span className="text-xs text-muted-foreground">
                      Người tải lên: {thesis.user?.name || "Không xác định"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{thesis.faculty}</TableCell>
                <TableCell>{new Date(thesis.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                <TableCell>
                  {thesis.processingTime !== undefined && (thesis.status === "completed" || thesis.status === "rejected") ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {thesis.processingTime < 60 
                        ? `${thesis.processingTime} giây` 
                        : `${Math.floor(thesis.processingTime / 60)} phút ${thesis.processingTime % 60} giây`}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(thesis.status)}</TableCell>
                <TableCell>
                  {thesis.status === "completed" ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Progress value={thesis.plagiarismScore} className="h-2 w-20" />
                        <span>{thesis.plagiarismScore}%</span>
                        <span className="text-xs text-muted-foreground">Truyền thống</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={thesis.aiPlagiarismScore} className="h-2 w-20 bg-secondary-foreground/20" />
                        <span>{thesis.aiPlagiarismScore}%</span>
                        <span className="text-xs text-muted-foreground">AI</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/thesis/${thesis._id}`}>Chi tiết</Link>
                  </Button>
                  
                  {thesis.status === "processing" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproveThesis(thesis._id)}
                      >
                        Phê duyệt
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectThesis(thesis._id)}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteThesis(thesis._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminThesisList;
