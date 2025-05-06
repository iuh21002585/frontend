import axios from 'axios';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // In production, use the deployed backend URL
  if (import.meta.env.PROD) {
    // Replace this with your actual backend URL on Render
    return 'https://backend-6c5g.onrender.com/api';
  }
  // In development, use the relative path for Vite's proxy
  return '/api';
};

// Use the appropriate API URL for the environment
const API_URL = getApiBaseUrl();

console.log('API URL configured as:', API_URL);

// Tạo instance của axios với base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache lưu trữ dữ liệu API
const apiCache = {
  data: new Map(),
  timestamp: new Map(),
  
  // Thời gian cache hết hạn (ms)
  expirationTime: {
    '/theses': 60000, // 1 phút
    '/theses/stats': 120000, // 2 phút
    default: 30000 // 30 giây
  },
  
  // Đặt dữ liệu vào cache
  set(key, data) {
    this.data.set(key, data);
    this.timestamp.set(key, Date.now());
  },
  
  // Lấy dữ liệu từ cache
  get(key) {
    const timestamp = this.timestamp.get(key);
    const expiration = this.expirationTime[key] || this.expirationTime.default;
    
    // Nếu dữ liệu đã hết hạn hoặc không tồn tại
    if (!timestamp || (Date.now() - timestamp > expiration)) {
      return null;
    }
    
    return this.data.get(key);
  },
  
  // Xóa một mục khỏi cache
  remove(key) {
    this.data.delete(key);
    this.timestamp.delete(key);
  },
  
  // Xóa toàn bộ cache
  clear() {
    this.data.clear();
    this.timestamp.clear();
  }
};

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    // Log với mức độ thấp hơn (verbose)
    if (process.env.NODE_ENV !== 'production') {
      console.log('API Request URL:', `${config.baseURL}${config.url}`);
    }
    
    const user = localStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm phương thức mở rộng để hỗ trợ cache
const apiWithCache = {
  ...api,
  
  // Override phương thức GET với hỗ trợ cache
  async get(url, config = {}) {
    // Kiểm tra xem có bỏ qua cache không
    const skipCache = config?.params?._skipCache || false;
    
    // Xóa tham số _skipCache để không gửi đến server
    if (config?.params?._skipCache) {
      const params = { ...config.params };
      delete params._skipCache;
      config = { ...config, params };
    }
    
    // Tạo key cache từ URL và tham số
    const paramString = config?.params ? JSON.stringify(config.params) : '';
    const cacheKey = `${url}${paramString}`;
    
    // Kiểm tra cache nếu không bỏ qua
    if (!skipCache) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
    }
    
    // Nếu không có trong cache hoặc bỏ qua cache, tiến hành call API
    try {
      const response = await api.get(url, config);
      
      // Lưu kết quả vào cache
      apiCache.set(cacheKey, response);
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Xóa cache cho endpoint cụ thể
  clearCache(url = null) {
    if (url) {
      // Xóa tất cả cache cho URL này
      const keys = Array.from(apiCache.data.keys());
      keys.forEach(key => {
        if (key.startsWith(url)) {
          apiCache.remove(key);
        }
      });
    } else {
      // Xóa toàn bộ cache
      apiCache.clear();
    }
  }
};

export default apiWithCache;
