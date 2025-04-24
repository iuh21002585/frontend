import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

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

  // Lấy thông báo khi component được mount
  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchNotifications();
    }
  }, [user]);

  // Lấy thông báo từ API
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      // Tạm mock data notifications
      const mockNotifications = [
        {
          _id: '1',
          title: 'Tải lên thành công',
          message: 'Luận văn của bạn đã được tải lên thành công và đang được xử lý',
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Kiểm tra hoàn tất',
          message: 'Luận văn "Đánh giá hiệu quả của phương pháp học máy" đã được kiểm tra xong',
          type: 'success',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
      
      // Tính số thông báo chưa đọc
      const unread = mockNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
      /*
      const { data } = await api.get('/notifications');
      setNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      */
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = async () => {
    try {
      /*
      await api.put('/notifications/read-all');
      */
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
    }
  };

  // Đánh dấu một thông báo đã đọc
  const markAsRead = async (id) => {
    try {
      /*
      await api.put(`/notifications/${id}/read`);
      */
      setNotifications(
        notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
    }
  };

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
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px]">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-0">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-medium">Thông báo</h3>
                        {unreadCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={markAllAsRead}
                          >
                            Đánh dấu tất cả đã đọc
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="p-2">
                          {notificationsLoading ? (
                            <div className="p-4 text-center text-muted-foreground">
                              Đang tải thông báo...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              Bạn không có thông báo nào
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {notifications.map((notification) => (
                                <div 
                                  key={notification._id} 
                                  className={`p-3 rounded-md border cursor-pointer ${notification.isRead ? '' : 'bg-primary/5'}`}
                                  onClick={() => markAsRead(notification._id)}
                                >
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-sm">{notification.title}</h4>
                                    {!notification.isRead && (
                                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                                        Mới
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDistance(new Date(notification.createdAt), new Date(), { 
                                      addSuffix: true 
                                    })}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
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
                <div className="hidden md:flex items-center">
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
                </div>
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
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors`}
                              onClick={(e) => {
                                e.preventDefault();
                                fetchNotifications();
                                setIsOpen(false);
                              }}
                            >
                              <div className="relative">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px]">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <span className="font-medium">Thông báo</span>
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
