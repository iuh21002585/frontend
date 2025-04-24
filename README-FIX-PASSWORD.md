# Hướng dẫn khắc phục vấn đề đăng nhập của ThesisGuard

## Vấn đề

Ứng dụng ThesisGuard hiện đang gặp vấn đề người dùng không thể đăng nhập do cách xử lý mật khẩu không nhất quán:

- **Nguyên nhân:** Mật khẩu trong cơ sở dữ liệu đang được lưu dưới dạng văn bản thuần túy (plain text), trong khi mô hình User có middleware pre-save sử dụng bcrypt để mã hóa mật khẩu.
- **Hậu quả:** Khi người dùng đăng nhập, hệ thống so sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong cơ sở dữ liệu, dẫn đến không khớp và đăng nhập thất bại.

## Giải pháp

Chúng tôi cung cấp hai giải pháp để khắc phục vấn đề này:

### 1. Sử dụng công cụ sửa mật khẩu tự động

Chúng tôi đã tạo ra một script đơn giản có thể giúp bạn kiểm tra và sửa vấn đề mật khẩu:

1. Đảm bảo máy chủ backend đang chạy (mặc định tại http://localhost:5000)
2. Mở terminal tại thư mục gốc của dự án
3. Chạy lệnh sau để thực thi script:

```bash
node fix-password.js
```

4. Làm theo hướng dẫn trên màn hình để:
   - Kiểm tra vấn đề đăng nhập cho một tài khoản cụ thể
   - Đặt lại mật khẩu cho tất cả tài khoản thành "123456"

### 2. Tự mình sửa đổi mã nguồn

Nếu bạn muốn tự khắc phục vấn đề, hãy làm theo các bước sau:

1. **Xác minh vấn đề**:
   - Khi người dùng không thể đăng nhập, hãy kiểm tra mật khẩu trong cơ sở dữ liệu
   - Nếu mật khẩu không được mã hóa (không bắt đầu bằng `$2a$`, `$2b$`, hoặc `$2y$`), đó là vấn đề

2. **Xác nhận mã nguồn đã có sẵn cơ chế khắc phục**:
   - File `src/models/User.js` đã có phương thức `matchPassword()` để kiểm tra cả mật khẩu thuần túy và mật khẩu đã mã hóa
   - File `src/controllers/userController.js` đã có cơ chế tự động mã hóa lại mật khẩu thuần túy

3. **Sửa cơ sở dữ liệu (nếu cần)**:
   - Có thể sử dụng API `/api/users/reset-passwords-public` với secret key "fix_passwords_now" để đặt lại mật khẩu cho tất cả người dùng thành "123456"
   - Có thể sử dụng API `/api/users/check-login-issue` để kiểm tra vấn đề đăng nhập cho một người dùng cụ thể

## Ngăn chặn vấn đề tương tự trong tương lai

Để ngăn chặn vấn đề này xảy ra trong tương lai, hãy đảm bảo:

1. **Không bao giờ lưu mật khẩu dưới dạng văn bản thuần túy** - luôn sử dụng bcrypt hoặc các thuật toán băm mật khẩu an toàn khác
2. **Sử dụng middleware pre-save** trong mô hình User để tự động mã hóa mật khẩu
3. **Kiểm tra kỹ cơ chế xác thực** trong controller để đảm bảo phương thức so sánh mật khẩu hoạt động đúng cách

## Tài liệu tham khảo

- `src/models/User.js`: Mô hình User với middleware pre-save và phương thức matchPassword
- `src/controllers/userController.js`: Controller xử lý đăng nhập, kiểm tra và sửa lỗi mật khẩu
- `fix-password.js`: Công cụ để kiểm tra và sửa vấn đề mật khẩu
