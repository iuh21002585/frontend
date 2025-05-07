/**
 * Script để sửa vấn đề mật khẩu trong IUH_PLAGCHECK
 * 
 * Vấn đề: Mật khẩu trong cơ sở dữ liệu được lưu ở dạng văn bản thuần túy (plain text)
 * trong khi mô hình User có middleware pre-save sử dụng bcrypt để mã hóa mật khẩu.
 * Người dùng không thể đăng nhập vì mật khẩu nhập vào không khớp với 
 * mật khẩu đã mã hóa trong cơ sở dữ liệu.
 * 
 * Script này cho phép người dùng:
 * 1. Đặt lại mật khẩu cho tất cả người dùng sang mật khẩu mặc định "123456"
 * 2. Kiểm tra vấn đề mật khẩu cho một người dùng cụ thể
 */

const readline = require('readline');
const axios = require('axios');

// Sử dụng biến môi trường hoặc fallback về localhost nếu chạy ở môi trường local
const API_URL = process.env.BACKEND_URL 
  ? `${process.env.BACKEND_URL}/api` 
  : 'https://backend-6c5g.onrender.com/api';

// Cho phép ghi đè URL API từ dòng lệnh
const cliArgs = process.argv.slice(2);
const apiArgIndex = cliArgs.findIndex(arg => arg === '--api');
if (apiArgIndex !== -1 && cliArgs.length > apiArgIndex + 1) {
  API_URL = cliArgs[apiArgIndex + 1];
}

console.log(`Kết nối tới API: ${API_URL}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Hiển thị menu chính
function showMainMenu() {
  console.log('\n===== IUH_PLAGCHECK - CÔNG CỤ SỬA VẤN ĐỀ MẬT KHẨU =====');
  console.log('1. Kiểm tra vấn đề đăng nhập cho một tài khoản');
  console.log('2. Đặt lại mật khẩu cho tất cả tài khoản (thành "123456")');
  console.log('3. Thoát');
  
  rl.question('\nChọn một tùy chọn (1-3): ', (choice) => {
    switch(choice) {
      case '1':
        checkLoginIssue();
        break;
      case '2':
        resetAllPasswords();
        break;
      case '3':
        console.log('Cảm ơn bạn đã sử dụng công cụ. Tạm biệt!');
        rl.close();
        break;
      default:
        console.log('Tùy chọn không hợp lệ. Vui lòng thử lại.');
        showMainMenu();
    }
  });
}

// Kiểm tra vấn đề đăng nhập cho một tài khoản cụ thể
async function checkLoginIssue() {
  rl.question('\nNhập email: ', (email) => {
    rl.question('Nhập mật khẩu: ', async (password) => {
      try {
        console.log('\nĐang kiểm tra thông tin đăng nhập...');
        
        const response = await axios.post(`${API_URL}/users/check-login-issue`, {
          email,
          password
        });
        
        const { user } = response.data;
        
        console.log('\n===== KẾT QUẢ KIỂM TRA =====');
        console.log(`Email: ${user.email}`);
        console.log(`Mật khẩu được mã hóa: ${user.passwordHashed ? 'Có' : 'Không'}`);
        console.log(`Mật khẩu khớp (bcrypt): ${user.passwordMatch ? 'Có' : 'Không'}`);
        console.log(`Mật khẩu khớp (văn bản thuần): ${user.rawPasswordMatch ? 'Có' : 'Không'}`);
        
        if (user.needsUpdate) {
          console.log('\nVẤN ĐỀ: Mật khẩu đang được lưu ở dạng văn bản thuần túy.');
          console.log('ĐÃ SỬA: Mật khẩu đã được tự động cập nhật sang dạng mã hóa.');
          console.log('Bạn có thể đăng nhập bình thường ngay bây giờ.');
        } else if (user.rawPasswordMatch) {
          console.log('\nVẤN ĐỀ: Mật khẩu đang được lưu ở dạng văn bản thuần túy.');
          console.log('Vui lòng thử đăng nhập vào hệ thống để tự động cập nhật mật khẩu sang dạng mã hóa.');
        } else if (user.passwordMatch) {
          console.log('\nTình trạng: Mật khẩu đã được mã hóa và hoạt động bình thường.');
        } else {
          console.log('\nVẤN ĐỀ: Mật khẩu không khớp. Có thể bạn đã nhập sai mật khẩu.');
          console.log('Bạn có thể sử dụng tùy chọn "Đặt lại mật khẩu" để đặt lại mật khẩu.');
        }
        
        returnToMainMenu();
      } catch (error) {
        console.error('\nLỗi khi kiểm tra thông tin đăng nhập:');
        if (error.response) {
          console.error(`${error.response.status}: ${error.response.data.message}`);
        } else {
          console.error(error.message);
        }
        returnToMainMenu();
      }
    });
  });
}

// Đặt lại mật khẩu cho tất cả tài khoản
async function resetAllPasswords() {
  rl.question('\nĐặt lại mật khẩu cho TẤT CẢ tài khoản thành "123456"? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      try {
        console.log('\nĐang đặt lại mật khẩu cho tất cả tài khoản...');
        
        const response = await axios.post(`${API_URL}/users/reset-passwords-public`, {
          secretKey: 'fix_passwords_now'
        });
        
        console.log(`\nThành công: ${response.data.message}`);
        console.log('Tất cả người dùng giờ có thể đăng nhập với mật khẩu "123456"');
        
        returnToMainMenu();
      } catch (error) {
        console.error('\nLỗi khi đặt lại mật khẩu:');
        if (error.response) {
          console.error(`${error.response.status}: ${error.response.data.message}`);
        } else {
          console.error(error.message);
        }
        returnToMainMenu();
      }
    } else {
      console.log('\nĐã hủy thao tác đặt lại mật khẩu.');
      returnToMainMenu();
    }
  });
}

// Trở về menu chính
function returnToMainMenu() {
  rl.question('\nNhấn Enter để trở về menu chính...', () => {
    showMainMenu();
  });
}

// Bắt đầu chương trình
console.log('Chào mừng đến với công cụ sửa vấn đề mật khẩu IUH_PLAGCHECK!');
console.log(`LƯU Ý: Đảm bảo rằng máy chủ backend đang chạy và truy cập được tại ${API_URL}`);

showMainMenu();
