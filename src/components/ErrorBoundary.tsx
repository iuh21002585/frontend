import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Cập nhật state để hiển thị UI fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Có thể log lỗi vào một service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleClearLocalStorage = (): void => {
    localStorage.clear();
    window.location.reload();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Hiển thị UI thay thế
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center text-destructive">Ứng dụng gặp sự cố</h2>
            <div className="bg-destructive/10 p-4 rounded-md">
              <p className="text-sm text-destructive font-mono break-all whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
            <p className="text-muted-foreground text-center">
              Lỗi này có thể do dữ liệu không hợp lệ được lưu trong trình duyệt của bạn.
              Bạn có thể thử xóa dữ liệu và tải lại trang.
            </p>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={this.handleClearLocalStorage} 
                variant="destructive"
              >
                Xóa dữ liệu cục bộ và tải lại
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Chỉ tải lại trang
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;