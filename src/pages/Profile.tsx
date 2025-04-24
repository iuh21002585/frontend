import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Settings, Check, X } from "lucide-react";
import api from "@/lib/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Định nghĩa schema validation
const profileFormSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  university: z.string().optional(),
  faculty: z.string().optional(),
  password: z.union([
    z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    z.string().length(0)
  ]),
  confirmPassword: z.union([
    z.string(),
    z.string().length(0)
  ]),
}).refine((data) => {
  // Nếu mật khẩu đã nhập mà không trống, thì confirmPassword cũng không được trống
  if (data.password && data.password.length > 0 && (!data.confirmPassword || data.confirmPassword.length === 0)) return false;
  
  // Nếu confirmPassword đã nhập mà không trống, thì password cũng không được trống
  if (data.confirmPassword && data.confirmPassword.length > 0 && (!data.password || data.password.length === 0)) return false;
  
  // Nếu cả hai đều nhập và không trống, thì phải giống nhau
  if (data.password && data.password.length > 0 && data.confirmPassword && data.confirmPassword.length > 0 && data.password !== data.confirmPassword) return false;
  
  return true;
}, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { user, updateUserInfo } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStats, setHasStats] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      university: user?.university || "",
      faculty: user?.faculty || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Lấy thống kê từ API
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Gọi API thực để lấy thống kê
      const { data } = await api.get('/theses/stats');
      setStats(data);
      setHasStats(true);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      // Đặt stats là null khi API lỗi
      setStats(null);
      setHasStats(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Reset form khi chuyển sang chế độ chỉnh sửa
  useEffect(() => {
    if (isEditing && user) {
      form.reset({
        name: user.name,
        email: user.email,
        university: user.university || "",
        faculty: user.faculty || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [isEditing, user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // Loại bỏ confirmPassword vì backend không cần
      const { confirmPassword, ...updateData } = values;
      
      // Chỉ gửi password nếu nó được điền
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await updateUserInfo(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
    }
  };

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

  return (
    <motion.div 
      className="space-y-6 container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="flex flex-col space-y-2 mx-auto max-w-3xl w-full" variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h2>
        <p className="text-muted-foreground">
          Xem và quản lý thông tin cá nhân của bạn
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={itemVariants} className="mx-auto max-w-3xl w-full">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  {isEditing ? "Chỉnh sửa thông tin cá nhân của bạn" : "Xem thông tin cá nhân của bạn"}
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Hủy
                  </Button>
                  <Button onClick={form.handleSubmit(onSubmit)}>
                    <Check className="mr-2 h-4 w-4" />
                    Lưu
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ và tên" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trường Đại học</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tên trường đại học" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="faculty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Khoa</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tên khoa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu mới</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Nhập mật khẩu mới" {...field} />
                          </FormControl>
                          <FormDescription>
                            Để trống nếu không muốn thay đổi mật khẩu
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Xác nhận mật khẩu</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Xác nhận mật khẩu mới" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Sinh viên
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Thông tin cơ bản</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Tên đầy đủ</p>
                        <p className="text-sm font-medium col-span-2">{user.name}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm font-medium col-span-2">{user.email}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Trường Đại học</p>
                        <p className="text-sm font-medium col-span-2">{user.university || "Chưa cập nhật"}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Khoa</p>
                        <p className="text-sm font-medium col-span-2">{user.faculty || "Chưa cập nhật"}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Ngày tham gia</p>
                        <p className="text-sm font-medium col-span-2">30/05/2023</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Thống kê tài khoản</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Tổng luận văn</p>
                        <p className="text-sm font-medium col-span-2">{stats?.totalTheses || 0}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                        <p className="text-sm font-medium col-span-2">{stats?.completedTheses || 0}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Đạo văn truyền thống</p>
                        <div className="flex items-center col-span-2">
                          <p className="text-sm font-medium mr-2">{stats?.traditionalPlagiarismScore || 0}%</p>
                          <Progress value={stats?.traditionalPlagiarismScore || 0} className="h-2 w-24" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <p className="text-sm text-muted-foreground">Đạo văn AI</p>
                        <div className="flex items-center col-span-2">
                          <p className="text-sm font-medium mr-2">{stats?.aiPlagiarismScore || 0}%</p>
                          <Progress value={stats?.aiPlagiarismScore || 0} className="h-2 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
