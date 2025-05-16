import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { FileText, FileUp, BookOpen, BookCheck, AlertTriangle, X, Info, File, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

// Định nghĩa các loại file được hỗ trợ
const SUPPORTED_FILE_TYPES = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/msword": "DOC",
  "application/vnd.oasis.opendocument.text": "ODT",
  "text/plain": "TXT",
  "application/rtf": "RTF",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "application/vnd.ms-powerpoint": "PPT",
};

// Kích thước file tối đa (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Tiêu đề phải có ít nhất 5 ký tự",
  }),
  abstract: z.string().min(20, {
    message: "Tóm tắt phải có ít nhất 20 ký tự",
  }),
  checkAiPlagiarism: z.boolean().default(true),
  checkTraditionalPlagiarism: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface FileInfo {
  file: File;
  progress: number;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  thesisId?: string;
  estimatedTime?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  _id: string;
  title: string;
  fileName: string;
  status: string;
  estimatedCompletionTime?: string;
}

interface UploadThesisProps {
  onUploadSuccess?: () => void;
}

const UploadThesis = ({ onUploadSuccess }: UploadThesisProps) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      abstract: "",
      checkAiPlagiarism: true,
      checkTraditionalPlagiarism: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một file luận văn để tải lên",
      });
      return;
    }

    if (!values.checkAiPlagiarism && !values.checkTraditionalPlagiarism) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một phương pháp kiểm tra đạo văn (AI hoặc truyền thống)",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Cập nhật trạng thái tất cả các file
      setFiles(prev => prev.map(fileInfo => ({
        ...fileInfo,
        status: 'uploading',
        progress: 0
      })));
      
      // Tải lên từng file một
      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        
        // Cập nhật UI để hiển thị file đang được tải lên
        setFiles(prev => 
          prev.map((fileInfo, idx) => 
            idx === i 
              ? { ...fileInfo, status: 'uploading', progress: 0 } 
              : fileInfo
          )
        );
        
        try {
          // Tạo FormData để gửi file và dữ liệu
          const formData = new FormData();
          formData.append('file', currentFile.file);
          formData.append('title', i === 0 ? values.title : `${values.title} - Phần ${i+1}`);
          formData.append('abstract', values.abstract);
          formData.append('checkAiPlagiarism', values.checkAiPlagiarism.toString());
          formData.append('checkTraditionalPlagiarism', values.checkTraditionalPlagiarism.toString());
          
          // Gọi API tải lên luận văn với theo dõi tiến trình
          // Sử dụng axios trực tiếp cho request
          const axios = await import('axios');
          const response = await axios.default.post(
            `${api.defaults.baseURL}/theses/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                // Thêm token xác thực nếu có
                ...(localStorage.getItem('user') ? {
                  'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`
                } : {})
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setFiles(prev => 
                    prev.map((fileInfo, idx) => 
                      idx === i 
                        ? { ...fileInfo, progress: percentCompleted }
                        : fileInfo
                    )
                  );
                }
              }
            }
          );
          
          const responseData = response.data as UploadResponse;
          
          // Cập nhật trạng thái thành công cho file với thông tin bổ sung
          setFiles(prev => 
            prev.map((fileInfo, idx) => 
              idx === i 
                ? { 
                    ...fileInfo, 
                    progress: 100, 
                    status: 'success',
                    thesisId: responseData._id,
                    estimatedTime: responseData.estimatedCompletionTime
                  }
                : fileInfo
            )
          );
          
          // Tạo thông báo khi tải lên thành công
          try {
            if (responseData._id && responseData.estimatedCompletionTime) {
              // Tạo thông tin thông báo
              const notificationData = {
                title: 'Tải lên thành công',
                message: `Luận văn "${responseData.title}" đã được tải lên thành công và đang được xử lý. Dự kiến hoàn thành vào ${new Date(responseData.estimatedCompletionTime).toLocaleString('vi-VN')}.`,
                type: 'success',
                link: `/thesis/${responseData._id}`, // Link đến trang chi tiết luận văn
                linkText: 'Xem luận văn', // Tùy chỉnh text cho link thay vì mặc định "Xem chi tiết"
              };
              
              // Thêm timeout ngắn hơn cho request tạo thông báo để tránh chờ đợi quá lâu
              await Promise.race([
                axios.default.post(
                  `${api.defaults.baseURL}/notifications`,
                  notificationData,
                  {
                    headers: {
                      // Thêm token xác thực nếu có
                      ...(localStorage.getItem('user') ? {
                        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`
                      } : {})
                    },
                    timeout: 5000 // Timeout ngắn hơn (5 giây) để tránh chờ đợi quá lâu
                  }
                ),
                new Promise((_, reject) => {
                  setTimeout(() => {
                    reject(new Error('Notification request timeout'));
                  }, 5000);
                })
              ]).catch(e => {
                console.warn("API thông báo không phản hồi, nhưng quá trình tải lên vẫn thành công:", e);
                
                // Lưu thông báo trong localStorage để hiển thị khi kết nối lại được
                try {
                  const pendingNotifications = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
                  pendingNotifications.push({
                    ...notificationData,
                    createdAt: new Date().toISOString(),
                    _id: `local-${Date.now()}`
                  });
                  localStorage.setItem('pendingNotifications', JSON.stringify(pendingNotifications));
                  console.log("Đã lưu thông báo vào localStorage để xử lý sau");
                } catch (localStorageError) {
                  console.error("Không thể lưu thông báo vào localStorage:", localStorageError);
                }
              });
            }
          } catch (notifError) {
            // Lỗi tạo thông báo không ảnh hưởng đến quá trình tải lên
            console.error("Lỗi khi tạo thông báo:", notifError);
          }
        } catch (error: any) {
          // Cập nhật trạng thái lỗi cho file
          setFiles(prev => 
            prev.map((fileInfo, idx) => 
              idx === i 
                ? { 
                    ...fileInfo, 
                    status: 'error',
                    errorMessage: error.response?.data?.message || "Lỗi khi tải lên file"
                  }
                : fileInfo
            )
          );
        }
      }
      
      // Kiểm tra xem có file nào tải thành công không
      const successCount = files.filter(f => f.status === 'success').length;
      
      if (successCount > 0) {
        const successFiles = files.filter(f => f.status === 'success');
        const firstEstimatedTime = successFiles.length > 0 && successFiles[0].estimatedTime
          ? new Date(successFiles[0].estimatedTime).toLocaleString('vi-VN')
          : 'trong thời gian sắp tới';
        
        toast({
          variant: "default",
          title: "🎉 Tải lên thành công",
          description: (
            <div className="space-y-3">
              <p className="font-medium text-green-700 text-base">
                {successCount}/{files.length} luận văn đã được tải lên thành công và đang được xử lý.
              </p>
              <div className="pt-2 border-t border-green-200">
                <div className="mt-2 bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="flex items-center text-sm font-medium text-green-800 mb-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thời gian xử lý:
                  </p>
                  <p className="ml-6 text-sm text-green-700">
                    Dự kiến hoàn thành: <span className="font-medium">{firstEstimatedTime}</span>
                  </p>
                </div>
                
                <div className="mt-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-blue-700">
                      Bạn sẽ nhận được email thông báo tại <span className="font-medium">{user?.email}</span> khi quá trình kiểm tra hoàn tất.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <Link 
                    to={successFiles.length > 0 ? `/thesis/${successFiles[0].thesisId}` : '/dashboard'}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Kiểm tra kết quả
                  </Link>
                </div>
              </div>
            </div>
          ),
          className: "border-green-300 bg-green-50",
          duration: 8000, // Hiển thị lâu hơn (8 giây)
        });
        
        // Gọi callback để thông báo đã tải lên thành công
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        
        if (successCount === files.length) {
          // Reset form nếu tất cả đều thành công
          form.reset();
          setFiles([]);
        }
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi tải lên luận văn",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const filesArray = Array.from(selectedFiles);
      filesArray.forEach(file => validateAndAddFile(file));
    }
  };

  const validateAndAddFile = (selectedFile: File) => {
    // Kiểm tra định dạng file (hỗ trợ nhiều loại)
    const fileType = selectedFile.type;
    if (!(fileType in SUPPORTED_FILE_TYPES)) {
      toast({
        variant: "destructive",
        title: "Định dạng không hỗ trợ",
        description: `Định dạng file không được hỗ trợ. Hỗ trợ các định dạng: PDF, DOCX, DOC, ODT, TXT, RTF, PPTX, PPT`,
      });
      return false;
    }
    
    // Kiểm tra kích thước file (tối đa 100MB)
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File quá lớn",
        description: "Kích thước file tối đa là 100MB",
      });
      return false;
    }
    
    // Kiểm tra file trùng lặp
    const isDuplicate = files.some(f => 
      f.file.name === selectedFile.name && 
      f.file.size === selectedFile.size
    );
    
    if (isDuplicate) {
      toast({
        variant: "destructive",
        title: "File trùng lặp",
        description: "File này đã được thêm vào danh sách tải lên",
      });
      return false;
    }
    
    // Thêm file vào danh sách
    setFiles(prev => [...prev, {
      file: selectedFile,
      progress: 0,
      status: 'waiting',
    }]);
    
    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      Array.from(droppedFiles).forEach(file => validateAndAddFile(file));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  // Helper function to get file extension
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  // Helper function để lấy tên ngắn gọn của file
  const getShortFileName = (filename: string, maxLength = 20) => {
    if (filename.length <= maxLength) return filename;
    
    const ext = filename.split('.').pop() || '';
    const nameWithoutExt = filename.substring(0, filename.length - ext.length - 1);
    
    if (nameWithoutExt.length <= maxLength - 3 - ext.length) {
      return filename;
    }
    
    return `${nameWithoutExt.substring(0, maxLength - 3 - ext.length)}...${ext ? `.${ext}` : ''}`;
  };
  
  // Helper function để hiển thị kích thước file theo định dạng dễ đọc
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    // Tính toán đơn vị phù hợp (Bytes, KB, MB, GB...)
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Làm tròn đến 2 chữ số thập phân và trả về chuỗi định dạng
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="border-2 border-dashed">
        <CardHeader>
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Tải lên luận văn mới</CardTitle>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardDescription>
              Điền thông tin và tải lên file luận văn của bạn để kiểm tra đạo văn. Bạn có thể chọn kiểm tra đạo văn bằng AI, phương pháp truyền thống, hoặc cả hai.
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề luận văn</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề luận văn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tóm tắt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Nhập tóm tắt luận văn" 
                          className="min-h-[100px] resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Tóm tắt ngắn gọn nội dung chính của luận văn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="checkAiPlagiarism"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Kiểm tra đạo văn AI</FormLabel>
                        <FormDescription>
                          Sử dụng công nghệ AI để phát hiện nội dung được tạo từ các công cụ như ChatGPT
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="checkTraditionalPlagiarism"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Kiểm tra đạo văn truyền thống</FormLabel>
                        <FormDescription>
                          Sử dụng phương pháp so sánh truyền thống để phát hiện đạo văn từ các nguồn học thuật có sẵn
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="space-y-2">
                  <Label htmlFor="thesis-file">File luận văn (Hỗ trợ nhiều định dạng, tối đa 100MB)</Label>
                  <div
                    className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${
                      isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
                    } ${files.length > 0 ? "bg-primary/5" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {files.length > 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-primary" />
                        <p className="font-medium">{files.length} file đã được chọn</p>
                        <ul className="list-none p-0 m-0 w-full max-w-md">
                          {files.map((file, index) => (
                            <li key={index} className={`flex items-center justify-between p-3 mb-3 rounded-lg shadow-sm ${
                              file.status === 'success' 
                                ? 'bg-green-50 border border-green-200' 
                                : file.status === 'error'
                                ? 'bg-red-50 border border-red-200'
                                : 'border'
                            }`}>
                              <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                  <FileText className={`h-5 w-5 ${
                                    file.status === 'success' ? 'text-green-600' : 'text-blue-600'
                                  }`} />
                                  <span className="font-medium">
                                    {getShortFileName(file.file.name)}
                                  </span>
                                  {file.status === 'success' && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">
                                      Thành công
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatFileSize(file.file.size)} • {SUPPORTED_FILE_TYPES[file.file.type] || getFileExtension(file.file.name)}
                                  
                                  {file.status === 'success' && file.estimatedTime && (
                                    <span className="ml-1 text-green-600">
                                      • Dự kiến hoàn thành: {new Date(file.estimatedTime).toLocaleTimeString('vi-VN')}
                                    </span>
                                  )}
                                </div>
                                {file.status === 'error' && (
                                  <div className="text-xs text-red-500 mt-1 bg-red-50 p-1 rounded">
                                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                                    {file.errorMessage}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {file.status === 'uploading' && (
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs text-blue-600 mb-1">{file.progress}%</span>
                                    <Progress value={file.progress} className="h-2 w-16" />
                                  </div>
                                )}
                                {file.status === 'waiting' && (
                                  <span className="text-xs text-muted-foreground">Chờ...</span>
                                )}
                                {file.status === 'success' ? (
                                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => removeFile(index)}
                                    className="h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                  >
                                    <X className="h-3 w-3 text-gray-600" />
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center gap-3 mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFiles([])}
                            className="flex items-center gap-2"
                            disabled={files.some(f => f.status === 'uploading')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Xóa tất cả
                          </Button>
                          
                          <div className="relative">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex items-center gap-2"
                              disabled={files.some(f => f.status === 'uploading')}
                            >
                              <Plus className="h-4 w-4" />
                              Thêm file khác
                            </Button>
                            <Input
                              type="file"
                              multiple
                              accept={Object.keys(SUPPORTED_FILE_TYPES).join(', ')}
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              disabled={files.some(f => f.status === 'uploading')}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileUp className="h-12 w-12 text-muted-foreground" />
                        <p className="text-lg font-medium">Kéo & thả file hoặc</p>
                        <div className="relative">
                          <Button type="button" variant="outline" className="mt-2">
                            Chọn file
                          </Button>
                          <Input
                            id="thesis-file"
                            type="file"
                            multiple
                            accept={Object.keys(SUPPORTED_FILE_TYPES).join(', ')}
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700 font-medium">Đang tải lên luận văn...</span>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-md border">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Tiến độ tải lên tổng thể</span>
                      <span className="font-semibold text-blue-700">{Math.round(files.reduce((acc, file) => acc + file.progress, 0) / files.length)}%</span>
                    </div>
                    <Progress 
                      value={files.reduce((acc, file) => acc + file.progress, 0) / files.length} 
                      className="h-2 bg-slate-200" 
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Vui lòng không đóng trình duyệt trong quá trình tải lên luận văn
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="pt-2">
                <Separator />
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isUploading || files.length === 0}
                >
                  {isUploading ? (
                    <>Đang tải lên...</>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Tải lên luận văn
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UploadThesis;
