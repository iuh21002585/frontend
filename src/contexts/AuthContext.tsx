import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface User {
  _id: string;
  id: string;
  email: string;
  isAdmin: boolean;
  name: string;
  university?: string;
  faculty?: string;
  token?: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, university?: string, faculty?: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (userInfo: Partial<User>) => Promise<void>;
  verifyEmail: (token: string, email: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, email: string, password: string) => Promise<void>;
  processGoogleAuth: (token: string, userId: string) => Promise<void>;
  linkGoogleAccount: (googleData: {googleId: string, googleEmail: string, profilePicture?: string}) => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
  isRedirectedFromVerification: boolean;
  setIsRedirectedFromVerification: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirectedFromVerification, setIsRedirectedFromVerification] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Error handling for localStorage access
    const loadUserFromStorage = () => {
      try {
        // Kiểm tra người dùng đã đăng nhập từ localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Validate essential user properties
            if (parsedUser && 
                typeof parsedUser === 'object' && 
                parsedUser._id && 
                parsedUser.email && 
                parsedUser.name) {
              setUser(parsedUser);
              // Set the Authorization header if token exists
              if (parsedUser.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
              }
            } else {
              // If user data is invalid, clear it
              console.warn("Invalid user data in localStorage, clearing...");
              localStorage.removeItem("user");
            }
          } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            // Clear corrupted data
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        // If localStorage access fails completely (e.g. in some privacy modes)
        // we just continue without user data
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/users/login', { email, password });
      
      const userData = {
        _id: data._id,
        id: data._id,
        email: data.email,
        name: data.name,
        university: data.university || '',
        faculty: data.faculty || '',
        isAdmin: data.isAdmin,
        token: data.token,
        profilePicture: data.profilePicture,
        isEmailVerified: true, // Nếu đăng nhập được thì email đã xác minh
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng quay trở lại!",
      });
    } catch (error: any) {
      // Kiểm tra nếu email chưa xác minh
      if (error.response?.data?.verificationRequired) {
        toast({
          variant: "destructive",
          title: "Email chưa xác minh",
          description: "Vui lòng kiểm tra email và xác minh tài khoản của bạn trước khi đăng nhập.",
        });
        setIsRedirectedFromVerification(true);
      } 
      // Kiểm tra nếu cần đăng nhập bằng Google
      else if (error.response?.data?.useGoogle) {
        toast({
          variant: "destructive",
          title: "Tài khoản Google",
          description: "Tài khoản này sử dụng đăng nhập Google. Vui lòng đăng nhập bằng Google.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: error.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập",
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, university?: string, faculty?: string) => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/users/register', { name, email, password, university, faculty });
      
      // Hiện tại API đã thay đổi, không tự động đăng nhập nữa mà yêu cầu xác minh email
      if (data.verificationRequired) {
        toast({
          title: "Đăng ký thành công",
          description: "Vui lòng kiểm tra email của bạn để xác minh tài khoản.",
        });
        setIsRedirectedFromVerification(true);
        return;
      }
      
      const userData = {
        _id: data._id,
        id: data._id,
        email: data.email,
        name: data.name,
        university: data.university || '',
        faculty: data.faculty || '',
        isAdmin: data.isAdmin,
        token: data.token,
        isEmailVerified: false,
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi đăng ký",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string, email: string) => {
    try {
      setLoading(true);
      
      const { data } = await api.get(`/users/verify-email?token=${token}&email=${email}`);
      
      if (data.verified) {
        toast({
          title: "Xác minh thành công",
          description: "Email của bạn đã được xác minh. Bạn có thể đăng nhập ngay bây giờ!",
        });
      }
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xác minh thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi xác minh email",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const resendVerification = async (email: string) => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/users/resend-verification', { email });
      
      toast({
        title: "Gửi lại email xác minh thành công",
        description: "Vui lòng kiểm tra email của bạn để xác minh tài khoản.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gửi lại email xác minh thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi gửi lại email xác minh",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/users/forgot-password', { email });
      
      toast({
        title: "Yêu cầu đặt lại mật khẩu đã được gửi",
        description: "Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.",
      });
      
      return data;
    } catch (error: any) {
      // Xử lý trường hợp đặc biệt khi tài khoản sử dụng Google
      if (error.response?.data?.useGoogle) {
        toast({
          title: "Tài khoản Google",
          description: "Tài khoản này sử dụng đăng nhập Google. Vui lòng đăng nhập bằng Google.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Yêu cầu đặt lại mật khẩu thất bại",
          description: error.response?.data?.message || "Đã xảy ra lỗi khi yêu cầu đặt lại mật khẩu",
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (token: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/users/reset-password', { token, email, password });
      
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Đặt lại mật khẩu thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const processGoogleAuth = async (token: string, userId: string) => {
    try {
      setLoading(true);
      
      // Validate inputs first
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid authentication token received');
      }
      
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID received');
      }
      
      console.log(`Processing Google auth with userId: ${userId}`);
      
      // Token từ Google Auth được truyền từ URL callback
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Lấy thông tin user từ API sử dụng route mới /me/:id
      const response = await api.get(`/users/me/${userId}`);
      
      // Validate response data
      if (!response || !response.data) {
        throw new Error('No user data received from server');
      }
      
      const userData = {
        _id: response.data._id || userId, // Fallback to userId if _id is missing
        id: response.data._id || userId,   // Fallback to userId if _id is missing
        email: response.data.email || '',
        name: response.data.name || 'User',
        university: response.data.university || '',
        faculty: response.data.faculty || '',
        isAdmin: !!response.data.isAdmin,
        token: token,
        profilePicture: response.data.profilePicture || '',
        isEmailVerified: true, // Tài khoản Google đã xác minh email
        googleId: response.data.googleId || ''
      };
      
      console.log('Google auth successful, setting user data');
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "Đăng nhập Google thành công",
        description: "Chào mừng quay trở lại!",
      });
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      // Clear any partial auth state that might be causing issues
      api.defaults.headers.common['Authorization'] = '';
      
      toast({
        variant: "destructive",
        title: "Đăng nhập Google thất bại",
        description: error.response?.data?.message || error.message || "Đã xảy ra lỗi khi đăng nhập bằng Google",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const linkGoogleAccount = async (googleData: {googleId: string, googleEmail: string, profilePicture?: string}) => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/users/link-google', googleData);
      
      // Cập nhật thông tin người dùng
      const updatedUserData = {
        ...user,
        googleId: googleData.googleId,
        isEmailVerified: true,
        profilePicture: user?.profilePicture || googleData.profilePicture
      };
      
      setUser(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      
      toast({
        title: "Liên kết tài khoản Google thành công",
        description: "Bạn có thể đăng nhập bằng Google từ lần sau.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Liên kết tài khoản Google thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi liên kết tài khoản Google",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const unlinkGoogleAccount = async () => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/users/unlink-google');
      
      // Cập nhật thông tin người dùng
      const updatedUserData = {
        ...user,
        googleId: undefined
      };
      
      setUser(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      
      toast({
        title: "Hủy liên kết tài khoản Google thành công",
        description: "Tài khoản của bạn không còn liên kết với Google.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hủy liên kết tài khoản Google thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi hủy liên kết tài khoản Google",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserInfo = async (userInfo: Partial<User>) => {
    try {
      setLoading(true);
      
      const { data } = await api.put('/users/profile', userInfo);
      
      const updatedUserData = {
        ...user,
        name: data.name,
        email: data.email,
        university: data.university || '',
        faculty: data.faculty || '',
        token: data.token
      };
      
      setUser(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin cá nhân đã được cập nhật!",
      });

      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật thông tin",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      // Clear Authorization header
      api.defaults.headers.common['Authorization'] = '';
    } catch (error) {
      console.error("Error during logout:", error);
    }
    
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateUserInfo,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      processGoogleAuth,
      linkGoogleAccount,
      unlinkGoogleAccount,
      isRedirectedFromVerification,
      setIsRedirectedFromVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};
