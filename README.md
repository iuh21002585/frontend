# IUH_PLAGCHECK - Hệ thống quản lý luận văn với công nghệ chống đạo văn

## Giới thiệu dự án

IUH_PLAGCHECK là một nền tảng hiện đại giúp quản lý, lưu trữ và kiểm tra đạo văn cho luận văn và báo cáo tốt nghiệp. Hệ thống hỗ trợ:

- **Phát hiện đạo văn truyền thống**: Kiểm tra tài liệu với hàng triệu tài liệu đã xuất bản và nội dung web
- **Phát hiện đạo văn AI**: Công nghệ tiên tiến giúp phát hiện nội dung được tạo bởi AI
- **Báo cáo chi tiết**: Cung cấp thông tin về vị trí đạo văn, nguồn gốc và tỷ lệ đạo văn trong tài liệu

Hệ thống được thiết kế để phục vụ tất cả các khoa ngành của trường đại học, từ kỹ thuật đến khoa học xã hội.

## Vai trò người dùng

1. **Người quản lý (Admin)**:

   - Quản lý tài liệu được người dùng tải lên
   - Thiết lập ngưỡng chấp nhận đạo văn
   - Xem và xóa các tài liệu
2. **Người dùng thông thường**:

   - Đăng ký và đăng nhập vào hệ thống
   - Tải lên và kiểm tra đạo văn trong tài liệu
   - Xem báo cáo chi tiết về tình trạng đạo văn

## Hướng dẫn sử dụng

### Cài đặt

```bash
# Bước 1: Cài đặt các thư viện cần thiết
npm install

# Bước 2: Khởi động máy chủ phát triển
npm run dev
```

### Sử dụng cơ bản

1. **Đăng ký / Đăng nhập**:

   - Người dùng mới có thể đăng ký tài khoản
   - Người dùng hiện có có thể đăng nhập vào hệ thống
2. **Tải lên tài liệu**:

   - Từ trang chính, chọn "Tải lên tài liệu"
   - Chọn file cần kiểm tra và tải lên
3. **Kiểm tra đạo văn**:

   - Hệ thống tự động phân tích tài liệu
   - Kết quả hiển thị tỷ lệ đạo văn truyền thống và đạo văn AI
4. **Xem báo cáo chi tiết**:

   - Chọn tài liệu để xem báo cáo chi tiết
   - Xem các đoạn bị đánh dấu là đạo văn và nguồn gốc tương ứng

### Tính năng đặc biệt

- **Bật/tắt kiểm tra đạo văn AI**: Người dùng có thể lựa chọn có kiểm tra đạo văn AI hay không
- **Xuất báo cáo**: Tải xuống báo cáo chi tiết về tình trạng đạo văn trong tài liệu
- **Lịch sử kiểm tra**: Xem lịch sử các tài liệu đã kiểm tra và kết quả tương ứng

## Thông tin liên hệ

