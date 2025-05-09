import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Kiểm tra token khi component được tải
  useEffect(() => {
    const validateToken = async () => {
      // Trước tiên kiểm tra xem có cả token và email
      if (!token || !email) {
        setTokenValid(false);
        setError('Token hoặc email không hợp lệ hoặc đã hết hạn');
        setTokenChecked(true);
        return;
      }

      try {
        // Gọi API để kiểm tra token (nếu có endpoint)
        // Nếu không có endpoint riêng, chúng ta sẽ chỉ kiểm tra cú pháp token
        if (token.length < 32) { // Token thường dài ít nhất 32 ký tự
          setTokenValid(false);
          setError('Token không hợp lệ');
        }
        
        setTokenChecked(true);
      } catch (err) {
        setTokenValid(false);
        setError('Không thể xác minh token. Vui lòng thử lại hoặc yêu cầu liên kết đặt lại mật khẩu mới.');
        setTokenChecked(true);
      }
    };

    validateToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await axios.post('/api/users/reset-password', {
        token,
        email,
        password
      });
      setMessage(data.message || 'Mật khẩu đã được đặt lại thành công');
      
      // Redirect to login after a successful reset
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      // Kiểm tra nếu token đã hết hạn từ response
      if (err.response && err.response.data && err.response.data.expired) {
        setTokenValid(false);
        setError('Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu liên kết mới.');
      } else {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : 'Đã xảy ra lỗi. Vui lòng thử lại hoặc yêu cầu đặt lại mật khẩu mới.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đang kiểm tra liên kết đặt lại mật khẩu...
          </h2>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đặt lại mật khẩu
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-medium">Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn</p>
                <p className="mt-2">Liên kết đặt lại mật khẩu chỉ có hiệu lực trong 24 giờ. Vui lòng yêu cầu liên kết mới.</p>
              </div>
              <div className="mt-6">
                <Link
                  to="/forgot-password"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Yêu cầu đường dẫn đặt lại mật khẩu mới
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đặt lại mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập mật khẩu mới của bạn bên dưới
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu mới
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;