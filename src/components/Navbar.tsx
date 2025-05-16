import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, Shield, BookOpen, Home, Info, User, LogOut, Settings, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistance } from "date-fns";
import api from "@/lib/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  // Mặc định chuyển hướng đến trang Dashboard hoặc Admin, tùy vào vai trò người dùng
  const getDefaultUserPage = () => {
    return user?.isAdmin ? "/admin" : "/dashboard";
  };

  // Theo dõi sự kiện cuộn để thay đổi kiểu dáng navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Kiểm tra và xử lý các thông báo đang chờ từ localStorage
  const processPendingNotifications = useCallback(() => {
    try {
      const pendingNotifications = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
      if (pendingNotifications.length > 0) {
        console.log(`Phát hiện ${pendingNotifications.length} thông báo đang chờ trong localStorage`);
        
        // Thêm vào danh sách thông báo hiện tại
        setNotifications(prevNotifications => {
          // Lọc ra các thông báo chưa tồn tại trong danh sách
          const newNotifications = pendingNotifications.filter(pending => 
            !prevNotifications.some(existing => 
              existing._id === pending._id || 
              (existing.title === pending.title && existing.message === pending.message)
            )
          );
          
          if (newNotifications.length > 0) {
            // Cập nhật số lượng thông báo chưa đọc
            setUnreadCount(prev => prev + newNotifications.length);
            
            // Nối mảng thông báo mới vào đầu mảng thông báo hiện tại
            return [...newNotifications, ...prevNotifications];
          }
          
          return prevNotifications;
        });
        
        // Xóa khỏi localStorage
        localStorage.removeItem('pendingNotifications');
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo đang chờ:", error);
    }
  }, []);

  // Lấy thông báo khi component được mount và cập nhật định kỳ
  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchNotifications();
      
      // Kiểm tra thông báo đang chờ
      processPendingNotifications();
      
      // Thiết lập cập nhật định kỳ mỗi 30 giây
      const notificationInterval = setInterval(() => {
        fetchNotifications();
        processPendingNotifications();
      }, 30000);
      
      return () => clearInterval(notificationInterval);
    }
  }, [user, processPendingNotifications]);
  
  // Hiển thị toast khi có thông báo mới
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  
  useEffect(() => {
    // Chỉ hiển thị thông báo khi số lượng thông báo chưa đọc tăng lên
    if (unreadCount > 0 && unreadCount > prevUnreadCount && !notificationsLoading) {
      toast({
        title: "Thông báo mới",
        description: `Bạn có ${unreadCount} thông báo chưa đọc`,
        variant: "default",
        className: "bg-primary text-white border-primary",
        action: (
          <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/20 hover:text-white" onClick={() => {
            document.querySelector('[data-popover-trigger="notification"]')?.click();
          }}>
            Xem
          </Button>
        ),
      });
    }
    
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, notificationsLoading]);

  // Đã loại bỏ hàm createFallbackNotifications để chỉ hiển thị thông báo thực từ API
  
  // Lấy thông báo từ API
  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationError(null); // Reset error state
    
    try {
      // Add AbortController for better timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        const { data } = await api.request({
          method: 'get',
          url: '/notifications',
          timeout: 8000, // 8 second timeout
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (data && data.length > 0) {
          setNotifications(data);
          
          // Tính số thông báo chưa đọc
          const unread = data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } else {
          console.log("Không có thông báo từ API");
          
          // Nếu không có thông báo từ API, hiển thị danh sách trống
          setNotifications([]); // Chỉ hiển thị thông báo thực từ API, không sử dụng dữ liệu mẫu
        }
      } catch (apiError: any) {
        clearTimeout(timeoutId);
        throw apiError;
      }
    } catch (error: any) {
      console.error("Lỗi khi lấy thông báo:", error);
      
      // Set appropriate error message based on error type
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || error.message === 'Notification fetch timeout') {
        setNotificationError("Máy chủ đang phản hồi chậm. Hiển thị dữ liệu lưu trữ tạm.");
        
        // Show toast for timeout errors
        toast({
          title: "Không thể kết nối đến máy chủ",
          description: "Máy chủ đang tải chậm hoặc không phản hồi. Đang hiển thị dữ liệu lưu trữ tạm.",
          variant: "destructive",
          duration: 5000,
        });
      } else if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        if (status === 408 || status === 504) {
          setNotificationError(`Máy chủ phản hồi quá chậm (${status}). Hiển thị dữ liệu lưu trữ tạm.`);
        } else {
          setNotificationError(`Lỗi máy chủ: ${status}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setNotificationError("Không nhận được phản hồi từ máy chủ.");
      } else {
        // Something else caused the error
        setNotificationError("Không thể tải thông báo. Vui lòng thử lại sau.");
      }
      
      // Khi có lỗi kết nối, hiển thị danh sách trống thay vì dữ liệu giả
      setNotifications([]);
      setUnreadCount(0); // Đặt lại số lượng thông báo chưa đọc
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      // Cập nhật UI trước để trải nghiệm người dùng mượt mà hơn (optimistic update)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      // Hiển thị toast thông báo
      toast({
        title: "Đã đánh dấu tất cả là đã đọc",
        variant: "default",
        duration: 3000,
      });
      
      // Add AbortController for better timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        // Gọi API với timeout và abort controller
        await api.request({
          method: 'put',
          url: '/notifications/read-all',
          timeout: 8000, // 8 giây timeout
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (apiError) {
        clearTimeout(timeoutId);
        
        if (apiError.name === 'AbortError' || apiError.code === 'ECONNABORTED') {
          console.warn("Thao tác đánh dấu tất cả đã đọc bị timeout:", apiError);
          // Không hiển thị toast lỗi vì UI đã được cập nhật
          // nhưng ghi log để theo dõi
        } else {
          console.warn("Không thể kết nối đến API thông báo, nhưng UI đã được cập nhật:", apiError);
        }
        // UI đã được cập nhật trước đó, nên không cần xử lý thêm
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      // Vẫn giữ trạng thái UI đã cập nhật để trải nghiệm tốt hơn
    }
  }, [toast]);

  // Đánh dấu một thông báo đã đọc
  const markAsRead = useCallback(async (id) => {
    try {
      // Cập nhật UI trước để trải nghiệm người dùng mượt mà hơn (optimistic update)
      setNotifications(prev => 
        prev.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Với các thông báo local, không cần gọi API
      if (id.toString().startsWith('local-')) {
        return;
      }
      
      // Add AbortController for better timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        // Gọi API với timeout và abort controller
        await api.request({
          method: 'put',
          url: `/notifications/${id}/read`,
          timeout: 8000, // 8 giây timeout
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (apiError) {
        clearTimeout(timeoutId);
        
        if (apiError.name === 'AbortError' || apiError.code === 'ECONNABORTED') {
          console.warn(`Thao tác đánh dấu đã đọc thông báo ${id} bị timeout:`, apiError);
        } else {
          console.warn(`Không thể kết nối đến API để đánh dấu đã đọc thông báo ${id}:`, apiError);
        }
        // Vẫn giữ trạng thái UI đã cập nhật để trải nghiệm tốt hơn
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      // Vẫn giữ trạng thái UI đã cập nhật để trải nghiệm tốt hơn
    }
  }, []);

  // Xác định nếu đường dẫn hiện tại khớp với liên kết
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm"
          : "bg-white dark:bg-gray-900"
      } border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo và tên ứng dụng */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                IUH_PLAGCHECK
              </span>
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 dark:hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </div>
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/about")
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 dark:hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Giới thiệu</span>
              </div>
            </Link>
          </div>

          {/* Các nút đăng nhập/đăng ký hoặc menu người dùng */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Thông báo khi người dùng không phải admin */}
                {!user.isAdmin && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant={unreadCount > 0 ? "default" : "ghost"} 
                        size="icon" 
                        className="relative"
                        data-popover-trigger="notification"
                      >
                        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-bell-notification text-primary-foreground' : ''}`} />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] animate-pulse-gentle bg-red-500 text-white border-none shadow-sm shadow-red-300">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-0">
                      <div className="flex items-center justify-between p-4 border-b bg-primary/5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Thông báo</h3>
                          {unreadCount > 0 && (
                            <Badge className="bg-primary text-white ml-1 animate-pulse-gentle">
                              {unreadCount} mới
                            </Badge>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={markAllAsRead}
                          >
                            Đánh dấu tất cả đã đọc
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="p-2">
                          {notificationsLoading ? (
                            <div className="p-6 text-center">
                              <div className="inline-block animate-pulse-gentle rounded-full bg-primary/10 p-3 mb-3">
                                <Bell className="h-5 w-5 text-primary/50" />
                              </div>
                              <p className="text-muted-foreground">Đang tải thông báo...</p>
                            </div>
                          ) : notificationError ? (
                            <div className="p-6 text-center">
                              <div className="inline-block rounded-full bg-red-100 p-3 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className="text-red-500 font-medium">Lỗi tải thông báo</p>
                              <p className="text-muted-foreground text-sm mt-1">{notificationError}</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-3"
                                onClick={fetchNotifications}
                              >
                                Thử lại
                              </Button>
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-6 text-center">
                              <div className="inline-block rounded-full bg-muted p-3 mb-3">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <p className="text-muted-foreground">Bạn chưa có thông báo nào</p>
                              <p className="text-xs text-muted-foreground mt-1">Thông báo sẽ hiển thị tại đây khi bạn thực hiện các hoạt động trên hệ thống</p>
                              <p className="text-xs text-muted-foreground mt-2">Ví dụ: khi bạn tải lên luận văn hoặc quá trình kiểm tra hoàn tất</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {notifications.map((notification) => (
                                <div 
                                  key={notification._id} 
                                  className={`p-3 rounded-md border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                                    notification.isRead 
                                      ? 'border-gray-200 hover:border-gray-300' 
                                      : notification.type === 'success'
                                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                        : notification.type === 'warning'
                                          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                                          : notification.type === 'error'
                                            ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                  } ${!notification.isRead ? 'animate-pulse-gentle' : ''}`}
                                  onClick={() => markAsRead(notification._id)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      {notification.type === 'success' && (
                                        <div className="rounded-full bg-green-100 p-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}
                                      {notification.type === 'warning' && (
                                        <div className="rounded-full bg-amber-100 p-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}
                                      {notification.type === 'error' && (
                                        <div className="rounded-full bg-red-100 p-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}
                                      {notification.type === 'info' && (
                                        <div className="rounded-full bg-blue-100 p-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}
                                      <h4 className="font-medium text-sm">{notification.title}</h4>
                                    </div>
                                    {!notification.isRead && (
                                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 shadow-sm animate-pulse-gentle">
                                        Mới
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                                    {notification.message}
                                  </p>
                                  <div className="flex flex-col gap-2 ml-6">
                                    <div className="flex justify-between items-center mt-2">
                                      <p className="text-xs text-muted-foreground">
                                        {formatDistance(new Date(notification.createdAt), new Date(), { 
                                          addSuffix: true 
                                        })}
                                      </p>
                                      {notification.link && (
                                        <Link 
                                          to={notification.link} 
                                          className="text-xs text-primary hover:text-primary/70 font-medium"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification._id);
                                          }}
                                        >
                                          {notification.linkText || 'Xem kết quả'}
                                        </Link>
                                      )}
                                    </div>
                                    
                                    {/* Đã xóa nút Xem chi tiết thừa ở đây */}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      <div className="p-2 border-t text-center">
                        <Link 
                          to="/dashboard" 
                          className="text-xs text-primary font-medium hover:underline"
                          onClick={() => markAllAsRead()}
                        >
                          Xem tất cả thông báo
                        </Link>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Hiển thị thông tin người dùng đã đăng nhập */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                    <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDefaultUserPage()} className="flex items-center cursor-pointer">
                        {user.isAdmin ? <Settings className="mr-2 h-4 w-4" /> : <BookOpen className="mr-2 h-4 w-4" />}
                        <span>{user.isAdmin ? "Quản trị" : "Trang cá nhân"}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <div className="flex items-center cursor-pointer" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* <div className="hidden md:flex items-center">
                  {user.isAdmin && location.pathname !== "/admin" && (
                    <Button asChild variant="default" size="sm" className="ml-2">
                      <Link to="/admin">
                        Quản trị
                      </Link>
                    </Button>
                  )}
                  {!user.isAdmin && location.pathname !== "/dashboard" && (
                    <Button asChild variant="default" size="sm" className="ml-2">
                      <Link to="/dashboard">
                        Trang cá nhân
                      </Link>
                    </Button>
                  )}
                </div> */}
              </>
            ) : (
              <>
                {/* Hiển thị nút đăng nhập/đăng ký cho người dùng chưa đăng nhập */}
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Đăng ký</Link>
                  </Button>
                </div>
              </>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        <span className="text-lg font-bold">IUH_PLAGCHECK</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3 py-4 flex flex-col">
                      <Link 
                        to="/" 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive("/") ? "bg-primary/10 text-primary" : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Trang chủ</span>
                      </Link>
                      <Link 
                        to="/about" 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive("/about") ? "bg-primary/10 text-primary" : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Info className="w-5 h-5" />
                        <span className="font-medium">Giới thiệu</span>
                      </Link>
                      {user && (
                        <>
                          {user.isAdmin && location.pathname !== "/admin" && (
                            <Link 
                              to="/admin" 
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                isActive("/admin") ? "bg-primary/10 text-primary" : ""
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <Settings className="w-5 h-5" />
                              <span className="font-medium">Quản trị</span>
                            </Link>
                          )}
                          
                          {!user.isAdmin && location.pathname !== "/dashboard" && (
                            <Link 
                              to="/dashboard" 
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                isActive("/dashboard") ? "bg-primary/10 text-primary" : ""
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <User className="w-5 h-5" />
                              <span className="font-medium">Trang cá nhân</span>
                            </Link>
                          )}

                          {/* Thông báo trong menu mobile */}
                          {!user.isAdmin && (
                            <Link
                              to="#"
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${unreadCount > 0 ? 'bg-primary/10' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                fetchNotifications();
                                setIsOpen(false);
                                document.querySelector('[data-popover-trigger="notification"]')?.click();
                              }}
                            >
                              <div className="relative">
                                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-primary animate-bell-notification' : ''}`} />
                                {unreadCount > 0 && (
                                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] animate-pulse-gentle bg-red-500 text-white border-none shadow-sm">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <span className={`font-medium ${unreadCount > 0 ? 'text-primary' : ''}`}>
                                Thông báo
                                {unreadCount > 0 && <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Mới</span>}
                              </span>
                            </Link>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-auto space-y-3">
                      {user ? (
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <Button 
                            asChild 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsOpen(false)}
                          >
                            <Link to="/login">Đăng nhập</Link>
                          </Button>
                          <Button 
                            asChild 
                            className="w-full"
                            onClick={() => setIsOpen(false)}
                          >
                            <Link to="/register">Đăng ký</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
