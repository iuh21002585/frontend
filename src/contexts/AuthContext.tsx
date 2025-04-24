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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (userInfo: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập từ localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }
    setLoading(false);
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
        token: data.token
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng quay trở lại!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/users/register', { name, email, password });
      
      const userData = {
        _id: data._id,
        id: data._id,
        email: data.email,
        name: data.name,
        university: data.university || '',
        faculty: data.faculty || '',
        isAdmin: data.isAdmin,
        token: data.token
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
    localStorage.removeItem("user");
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserInfo }}>
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
