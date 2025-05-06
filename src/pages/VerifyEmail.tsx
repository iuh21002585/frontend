import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setVerifying(false);
        setErrorMessage("Link xác minh email không hợp lệ. Vui lòng kiểm tra lại link trong email của bạn.");
        return;
      }

      try {
        const response = await api.get(`/users/verify-email?token=${token}&email=${email}`);
        if (response.data && response.data.verified) {
          setSuccess(true);
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setErrorMessage("Có lỗi xảy ra khi xác minh email của bạn.");
        }
      } catch (error) {
        console.error("Lỗi xác minh email:", error);
        if (error.response && error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Có lỗi xảy ra khi xác minh email của bạn. Vui lòng thử lại sau.");
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyEmailToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Xác minh Email</h1>

        {verifying && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Đang xác minh email của bạn...</p>
          </div>
        )}

        {!verifying && success && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Xác minh thành công!</h2>
            <p className="text-gray-600 mb-6">Email của bạn đã được xác minh. Bây giờ bạn có thể đăng nhập vào tài khoản.</p>
            <p className="text-gray-500 text-sm">Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây...</p>
          </div>
        )}

        {!verifying && !success && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Xác minh thất bại</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
              >
                Đăng ký
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;