/**
 * Công cụ tính toán Similarity Index cho luận văn
 * Được chia sẻ giữa ThesisView và ThesisList
 */

interface TextMatch {
  similarity?: number;
  sourceText?: string;
  thesisText?: string;
  source?: {
    url?: string;
    title?: string;
    author?: string;
  };
}

/**
 * Interface chung cho tất cả thuộc tính luận văn có thể cần
 * được sử dụng trong quá trình tính toán similarity
 */
export interface ThesisWithMatches {
  // Thuộc tính cơ bản
  _id?: string;
  title?: string;
  abstract?: string;
  faculty?: string;
  author?: any;
  createdAt?: string;
  status?: string;
  
  // Thuộc tính liên quan tới đánh giá đạo văn
  textMatches?: TextMatch[];
  plagiarismScore?: number;
  aiGeneratedScore?: number;
  aiPlagiarismScore?: number;
  processedSources?: any[];
  plagiarismDetails?: any[];
}

/**
 * Tính toán điểm Similarity Index cho luận văn
 * @param thesis Dữ liệu luận văn với thông tin textMatches
 * @returns Phiên bản cập nhật của dữ liệu luận văn với plagiarismScore và aiPlagiarismScore
 */
export const calculateSimilarityIndex = <T extends ThesisWithMatches>(thesis: T): T => {
  if (!thesis || thesis.status !== "completed") {
    return thesis;
  }

  // Tạo bản sao để không ảnh hưởng đến dữ liệu gốc
  const result = { ...thesis };

  // Tính toán điểm đạo văn truyền thống
  if (thesis.plagiarismScore !== undefined) {
    // Nếu đã có điểm, làm tròn
    result.plagiarismScore = Math.round(thesis.plagiarismScore);
  } else if (thesis.textMatches && thesis.textMatches.length > 0) {
    // Kiểm tra xem có match nào là 100% không
    const hasExactMatch = thesis.textMatches.some(match => match.similarity === 100);
    
    if (hasExactMatch) {
      // Nếu có match 100%, điểm đạo văn là 100%
      result.plagiarismScore = 100;
    } else {
      // Tính trung bình các match
      const totalMatches = thesis.textMatches.length;
      const totalSimilarity = thesis.textMatches.reduce((total, match) => {
        return total + (match.similarity || 0);
      }, 0);
      
      // Chuẩn hóa và làm tròn điểm
      const averageSimilarity = totalSimilarity / totalMatches;
      result.plagiarismScore = Math.min(100, Math.round(averageSimilarity));
    }
  } else {
    // Không có match nào
    result.plagiarismScore = 0;
  }

  // Tính toán điểm đạo văn AI
  if (thesis.aiGeneratedScore !== undefined) {
    // Sử dụng điểm AI từ backend
    result.aiPlagiarismScore = Math.round(thesis.aiGeneratedScore);
  } else if (thesis.aiPlagiarismScore !== undefined) {
    // Hoặc sử dụng điểm AI đã tính trước đó
    result.aiPlagiarismScore = Math.round(thesis.aiPlagiarismScore);
  } else {
    // Không có dữ liệu AI
    result.aiPlagiarismScore = 0;
  }

  return result;
};
