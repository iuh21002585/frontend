import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleClearDataAndReload = (): void => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies (optional)
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
    
    // Reload the page
    window.location.reload();
  };

  handleReloadOnly = (): void => {
    // Just reload the page without clearing data
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const isTypeError = this.state.error?.name === 'TypeError' && 
                          this.state.error?.message.includes('is not a function');
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700">Ứng dụng gặp sự cố</CardTitle>
              <CardDescription className="text-red-600">
                {isTypeError 
                  ? "TypeError: V is not a function" 
                  : this.state.error?.message || "Đã xảy ra lỗi không xác định"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              {isTypeError ? (
                <p className="text-gray-700">
                  Lỗi này có thể do dữ liệu không hợp lệ được lưu trong trình duyệt của bạn. 
                  Bạn có thể thử xóa dữ liệu và tải lại trang.
                </p>
              ) : (
                <p className="text-gray-700">
                  Đã xảy ra lỗi trong ứng dụng. Bạn có thể thử tải lại trang hoặc xóa dữ liệu cục bộ.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2 pb-6">
              <Button 
                onClick={this.handleClearDataAndReload} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Xóa dữ liệu cục bộ và tải lại
              </Button>
              <Button 
                onClick={this.handleReloadOnly} 
                variant="outline" 
                className="w-full sm:w-auto"
              >
                Chỉ tải lại trang
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;