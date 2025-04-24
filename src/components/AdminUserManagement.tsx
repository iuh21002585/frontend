import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Bell, 
  Upload, 
  CheckCircle, 
  Trash2, 
  Edit, 
  CheckCheck, 
  FileText, 
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollArea as ScrollAreaComponent } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, 
  UserPlus, 
  UserCog, 
  UserX, 
  MoreHorizontal, 
  Shield, 
  Search,
  Filter,
  RefreshCw,
  ArrowUpDown,
  CloudCog
} from "lucide-react";
import api from "@/lib/api";

// Kiểu dữ liệu cho người dùng
interface UserData {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  thesesCount: number;
}

// Schema cho form tạo hoặc chỉnh sửa người dùng
const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự",
  }),
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự",
  }).optional(),
  isAdmin: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      isAdmin: false,
    },
  });

  // Fetch danh sách người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Gọi API lấy danh sách người dùng
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể lấy danh sách người dùng.",
        });
        // Nếu không có dữ liệu, hiển thị danh sách trống
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);

  // Xử lý tạo/chỉnh sửa người dùng
  const onSubmitUser = async (values: UserFormValues) => {
    try {
      if (isEditMode && selectedUser) {
        // Gọi API cập nhật người dùng
        await api.put(`/users/${selectedUser._id}`, values);
        
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === selectedUser._id 
              ? { ...user, name: values.name, email: values.email, isAdmin: values.isAdmin } 
              : user
          )
        );
        
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin người dùng.",
        });
      } else {
        // Gọi API tạo người dùng mới
        const { data } = await api.post('/users', values);
        
        // Thêm người dùng mới vào state
        setUsers(prevUsers => [...prevUsers, {
          _id: data._id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
          thesesCount: 0,
          createdAt: new Date().toISOString()
        }]);
        
        toast({
          title: "Thành công",
          description: "Đã tạo người dùng mới.",
        });
      }
      
      // Reset form
      form.reset();
      setIsEditMode(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Lỗi khi lưu thông tin người dùng:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lưu thông tin người dùng.",
      });
    }
  };

  // Xử lý khi chọn sửa người dùng
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsEditMode(true);
    
    form.reset({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      password: "", // Không hiển thị mật khẩu
    });
  };

  // Xử lý khi xóa người dùng
  const handleDeleteUser = async (userId: string) => {
    try {
      // Gọi API xóa người dùng
      await api.delete(`/users/${userId}`);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng.",
      });
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa người dùng.",
      });
    }
  };

  // Xử lý khi thay đổi quyền quản trị
  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      // Gọi API cập nhật quyền quản trị
      await api.put(`/users/${userId}`, { isAdmin: !currentIsAdmin });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isAdmin: !currentIsAdmin } 
            : user
        )
      );
      
      toast({
        title: "Thành công",
        description: `Đã ${!currentIsAdmin ? "cấp" : "hủy"} quyền quản trị viên.`,
      });
    } catch (error) {
      console.error("Lỗi khi thay đổi quyền quản trị:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thay đổi quyền quản trị.",
      });
    }
  };

  // Xử lý khi thay đổi cột sắp xếp
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Lọc và sắp xếp danh sách người dùng
  const filteredAndSortedUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof UserData];
      const bValue = b[sortColumn as keyof UserData];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === "asc" 
          ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
          : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }
      
      return 0;
    });

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-56 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <motion.div variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setIsEditMode(false);
                form.reset({
                  name: "",
                  email: "",
                  password: "",
                  isAdmin: false,
                });
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? "Chỉnh sửa thông tin người dùng hiện có" 
                    : "Nhập thông tin để tạo người dùng mới"}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitUser)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên người dùng" {...field} />
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
                          <Input placeholder="example@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isEditMode ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}</FormLabel>
                        <FormControl>
                          <Input placeholder="******" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Quyền quản trị viên</FormLabel>
                          <FormDescription>
                            Người dùng có quyền quản trị hệ thống
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button type="submit">{isEditMode ? "Cập nhật" : "Tạo mới"}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="whitespace-nowrap" onClick={() => setSearchTerm("")}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
            <CardDescription>
              Tổng số: {filteredAndSortedUsers.length} người dùng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      Tên
                      {sortColumn === "name" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                    <div className="flex items-center">
                      Email
                      {sortColumn === "email" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("isAdmin")}>
                    <div className="flex items-center">
                      Vai trò
                      {sortColumn === "isAdmin" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("thesesCount")}>
                    <div className="flex items-center">
                      Số luận văn
                      {sortColumn === "thesesCount" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center">
                      Ngày tạo
                      {sortColumn === "createdAt" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUsers.map((user, index) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge className="bg-blue-100 text-blue-600 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Quản trị viên
                          </Badge>
                        ) : (
                          <Badge variant="outline">Người dùng</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {typeof user.thesesCount === 'number' ? user.thesesCount : 0}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {user.isAdmin ? "Hủy quyền quản trị" : "Cấp quyền quản trị"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <UserX className="h-4 w-4 mr-2 text-destructive" />
                                  <span className="text-destructive">Xóa tài khoản</span>
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
                                  <DialogDescription>
                                    Bạn có chắc muốn xóa người dùng <span className="font-medium">{user.name}</span>?
                                    Hành động này không thể hoàn tác.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Hủy</Button>
                                  </DialogClose>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(user._id)}
                                  >
                                    Xóa
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredAndSortedUsers.length} trong tổng số {users.length} người dùng
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminUserManagement;
