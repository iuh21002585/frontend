// Enhanced error handling for timeouts in ThesisList component

// This utility function dispatches a custom timeout event 
// when an API call takes too long to respond
export const notifyApiTimeout = (url: string) => {
  if (typeof window !== 'undefined') {
    const timeoutEvent = new CustomEvent('api-timeout', { 
      detail: { 
        url,
        timestamp: Date.now()
      } 
    });
    window.dispatchEvent(timeoutEvent);
    console.warn(`API timeout event dispatched for: ${url}`);
  }
};

// This utility handles common timeout errors
export const handleApiTimeout = (error: any, url: string) => {
  // Log the error
  console.error('API timeout or error:', url, error);
  
  // Dispatch custom event
  notifyApiTimeout(url);
  
  // Return a generic error message that can be shown to users
  if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
    return 'Kết nối đến máy chủ đã quá thời gian chờ. Vui lòng thử lại sau.';
  } else if (error.response) {
    if (error.response.status === 408 || error.response.status === 504) {
      return `Máy chủ phản hồi quá chậm (${error.response.status}). Vui lòng thử lại sau.`;
    } else {
      return `Lỗi máy chủ: ${error.response.status}`;
    }
  } else if (error.request) {
    return 'Không nhận được phản hồi từ máy chủ.';
  } else {
    return 'Có lỗi xảy ra. Vui lòng thử lại sau.';
  }
};
