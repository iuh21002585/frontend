import { useState } from "react";
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
  faculty: z.string().min(2, {
    message: "Vui lòng chọn khoa",
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
      faculty: "",
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
          formData.append('faculty', values.faculty);
          formData.append('checkAiPlagiarism', values.checkAiPlagiarism.toString());
          formData.append('checkTraditionalPlagiarism', values.checkTraditionalPlagiarism.toString());
          
          // Gọi API tải lên luận văn với theo dõi tiến trình
          await api.post('/theses/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
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
          });
          
          // Cập nhật trạng thái thành công cho file
          setFiles(prev => 
            prev.map((fileInfo, idx) => 
              idx === i 
                ? { ...fileInfo, progress: 100, status: 'success' }
                : fileInfo
            )
          );
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
        toast({
          title: "Tải lên thành công",
          description: `${successCount}/${files.length} luận văn đã được tải lên thành công và đang được kiểm tra.`,
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
                  name="faculty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khoa</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn khoa của bạn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cntt">Công nghệ thông tin</SelectItem>
                          <SelectItem value="dtvt">Điện tử viễn thông</SelectItem>
                          <SelectItem value="cokhi">Cơ khí</SelectItem>
                          <SelectItem value="diendt">Điện - Điện tử</SelectItem>
                          <SelectItem value="xaydung">Xây dựng</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <ul className="list-none p-0 m-0">
                          {files.map((file, index) => (
                            <li key={index} className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="text-xs">
                                {getShortFileName(file.file.name)}
                              </Badge>
                              {file.status === 'uploading' ? (
                                <Progress value={file.progress} className="h-2 w-20" />
                              ) : file.status === 'success' ? (
                                <Info className="h-4 w-4 text-green-500" />
                              ) : file.status === 'error' ? (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              ) : (
                                <></>
                              )}
                              <X className="h-4 w-4 text-red-500 cursor-pointer" onClick={() => removeFile(index)} />
                            </li>
                          ))}
                        </ul>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFiles([])}
                          className="mt-2"
                        >
                          Chọn file khác
                        </Button>
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
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span>Đang tải lên...</span>
                    <span>{files.reduce((acc, file) => acc + file.progress, 0) / files.length}%</span>
                  </div>
                  <Progress value={files.reduce((acc, file) => acc + file.progress, 0) / files.length} className="h-2" />
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
