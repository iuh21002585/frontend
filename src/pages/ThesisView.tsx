import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { calculateSimilarityIndex } from "@/utils/similarityCalculator";

interface PlagiarismDetail {
  originalText: string;
  highlightedText: string;
  source: string;
  similarity: number;
  isAiGenerated: boolean;
}

interface TextMatch {
  sourceText: string;
  thesisText: string;
  similarity: number;
  source: {
    title: string;
    author: string;
    url: string;
    publication?: string;
    year?: string;
    domain?: string;
    dateExtracted?: string;
  };
  paragraph?: number;
  charPositionInThesis?: number;
  pageNumber?: number;
}

interface ThesisDetail {
  _id: string;
  title: string;
  abstract: string;
  author?: {
    _id?: string;
    name?: string;
  };
  faculty: string;
  createdAt: string;
  status: "processing" | "completed" | "rejected";
  plagiarismScore: number;
  aiPlagiarismScore: number;
  plagiarismDetails: PlagiarismDetail[];
  textMatches: TextMatch[];
  content?: string;
  fileUrl?: string;
  extractionError?: boolean;
  processedSources?: any[];
  aiPlagiarismDetails?: any[];
}

const ThesisView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [thesis, setThesis] = useState<ThesisDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRechecking, setIsRechecking] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);

  // Danh sách các domain uy tín/nguồn gốc thường được ưu tiên
  const priorityDomains = [
    "wikipedia.org",
    "scholar.google.com",
    "researchgate.net",
    "academia.edu",
    "sciencedirect.com",
    "jstor.org",
    "ieee.org",
    "springer.com",
    "nature.com",
    "oxford",
    "cambridge",
    "harvard",
    ".edu.vn",
    ".edu",
    ".gov"
  ];
  
  // Hàm kiểm tra xem url có phải là từ domain ưu tiên
  const isPrioritySource = (url: string) => {
    if (!url) return false;
    return priorityDomains.some(domain => url.includes(domain));
  };
  
  // Hàm trích xuất domain từ URL
  const extractDomain = (url: string) => {
    if (!url) return "";
    try {
      // Loại bỏ protocol, www. và lấy phần domain chính
      const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
      return domain;
    } catch (e) {
      return url;
    }
  };
  
  // Hàm nhận diện và chuẩn hóa tên nguồn
  const identifySourceName = (url: string, title: string) => {
    if (!url) return title || "Không xác định";
    
    // Xác định các nguồn phổ biến để hiển thị tên chuẩn
    if (url.includes("wikipedia.org")) return "Wikipedia";
    if (url.includes("scholar.google.com")) return "Google Scholar";
    if (url.includes("researchgate.net")) return "ResearchGate";
    if (url.includes("academia.edu")) return "Academia";
    if (url.includes("sciencedirect.com")) return "ScienceDirect";
    if (url.includes("jstor.org")) return "JSTOR";
    if (url.includes("ieee.org")) return "IEEE";
    if (url.includes("springer.com")) return "Springer";
    if (url.includes("nature.com")) return "Nature";
    
    // Nếu có title, ưu tiên sử dụng title
    if (title) return title;
    
    // Nếu không nhận diện được nguồn cụ thể, trả về tên domain
    return extractDomain(url);
  };
  
  // Hàm làm sạch nội dung trùng lặp, loại bỏ các nội dung không liên quan
  const cleanSourceText = (text: string): string => {
    if (!text) return "";
    
    // Loại bỏ các đoạn nội dung thường là điều hướng hoặc mục lục của trang web
    const patterns = [
      /menu|navigation|sidebar|header|footer|copyright|breadcrumb/gi,
      /Table of contents|Mục lục|Nội dung chính/gi,
      /\[edit\]|\[sửa\]|\[\d+\]/gi,
      /Main page|Trang chính|Home page/gi
    ];
    
    let cleanedText = text;
    patterns.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });
    
    // Loại bỏ nhiều khoảng trắng liên tiếp
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    
    return cleanedText;
  };
  
  useEffect(() => {
    // Lấy chi tiết luận văn từ API
    const fetchThesisDetail = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/theses/${id}`);
        
        // Tính toán Similarity Index
        const processedData = calculateSimilarityIndex(data);
        
        // Xử lý thêm processedSources nếu cần
        if (processedData.textMatches && processedData.textMatches.length > 0 && !processedData.processedSources) {
          processedData.processedSources = processSourcesFromMatches(processedData.textMatches);
        }
        
        setThesis(processedData);
      } catch (error: any) {
        console.error("Lỗi khi lấy chi tiết luận văn:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error.response?.data?.message || "Đã xảy ra lỗi khi tải thông tin luận văn",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchThesisDetail();
    }
  }, [id, toast]);

  const handleRecheckPlagiarism = async () => {
    if (!thesis?._id) return;
    
    setIsRechecking(true);
    try {
      const { data } = await api.post(`/theses/${thesis._id}/recheck`);
      
      // Tính toán Similarity Index mới và cập nhật state
      const processedData = calculateSimilarityIndex(data);
      
      // Xử lý thêm processedSources nếu cần
      if (processedData.textMatches && processedData.textMatches.length > 0 && !processedData.processedSources) {
        processedData.processedSources = processSourcesFromMatches(processedData.textMatches);
      }
      
      setThesis(processedData);
      
      toast({
        title: "Thành công",
        description: "Đã kiểm tra lại đạo văn cho luận văn này",
      });
    } catch (error: any) {
      console.error("Lỗi khi kiểm tra lại đạo văn:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi kiểm tra lại đạo văn",
      });
    } finally {
      setIsRechecking(false);
    }
  };

  const handleDownload = async (type: string) => {
    if (!thesis?._id) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không tìm thấy file để tải xuống",
      });
      return;
    }

    try {
      // Tạo URL đầy đủ đến API endpoint với protocol và host
      const host = window.location.origin;
      const downloadUrl = `${host}/api/theses/report/${thesis._id}/${type}`;
      
      // Mở URL trong tab mới để download
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Đang tải xuống",
        description: `Báo cáo đạo văn ${type === 'ai' ? 'AI' : 'truyền thống'} đang được tải xuống.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tải xuống file",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa luận văn này không?")) {
      return;
    }

    try {
      await api.delete(`/theses/${thesis?._id}`);
      toast({
        title: "Thành công",
        description: "Đã xóa luận văn thành công",
      });
      // Điều hướng người dùng quay lại trang danh sách
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi xóa luận văn",
      });
    }
  };

  // Hàm xử lý sources từ matches
  const processSourcesFromMatches = (matches: any[]) => {
    if (!matches || matches.length === 0) return [];

    // Step 1: Group matches by source URL
    const sourcesByUrl: Record<string, any[]> = {};
    
    matches.forEach(match => {
      if (!match.source || !match.source.url) return;
      const sourceUrl = match.source.url;
      if (!sourcesByUrl[sourceUrl]) {
        sourcesByUrl[sourceUrl] = [];
      }
      sourcesByUrl[sourceUrl].push(match);
    });

    // Step 2: Process each source
    const processedSources: any[] = [];
    
    Object.entries(sourcesByUrl).forEach(([url, urlMatches]) => {
      const domain = extractDomain(url);
      const firstMatch = urlMatches[0];
      const isPriority = isPrioritySource(url);
      
      // Calculate total similarity score and content metrics
      let totalSimilarity = 0;
      let characterCount = 0;
      let wordCount = 0;
      let maxSimilarity = 0;
      let significantMatches = 0;
      
      // Lọc các match có độ tương đồng đáng kể (> 30%)
      const validMatches = urlMatches.filter(match => (match.similarity || 0) > 30);
      
      validMatches.forEach(match => {
        // Use the highest similarity value for sorting
        if (match.similarity > maxSimilarity) {
          maxSimilarity = match.similarity;
        }
        
        // Sum up similarity for averaging
        totalSimilarity += match.similarity || 0;
        
        // Count words and characters for statistics
        if (match.thesisText) {
          characterCount += match.thesisText.length;
          wordCount += match.thesisText.split(/\s+/).length;
          
          // Đếm các match có độ tương đồng cao (> 60%)
          if (match.similarity > 60) {
            significantMatches++;
          }
        }
      });
      
      // Chỉ thêm nguồn nếu có ít nhất một match đáng kể hoặc tổng độ tương đồng đủ cao
      if (validMatches.length > 0 && (maxSimilarity >= 60 || significantMatches > 0 || validMatches.length >= 3)) {
        // Calculate average similarity
        const avgSimilarity = validMatches.length > 0 ? 
          Math.round(totalSimilarity / validMatches.length) : 0;
        
        // Create source object with all metrics
        processedSources.push({
          title: firstMatch.source.title || 'Không xác định',
          displayName: identifySourceName(url, firstMatch.source.title || 'Không xác định'),
          author: firstMatch.source.author || 'Không xác định',
          url: url,
          domain: domain,
          type: isPriority ? 'Nguồn học thuật' : 'Nguồn phổ thông',
          wordCount: wordCount,
          characterCount: characterCount,
          totalSimilarity: avgSimilarity,
          maxSimilarity: maxSimilarity, // Store max similarity for sorting
          originalMatches: validMatches, // Chỉ lưu các match có độ tương đồng đáng kể
          matches: [],
          isPriority,
          originalUrl: url,
          matchCount: validMatches.length,  // Số lượng match hợp lệ
          significantMatches  // Số lượng match có độ tương đồng cao
        });
      }
    });

    // Step 3: Sort sources by maxSimilarity first (highest to lowest), then by match count
    return processedSources.sort((a, b) => {
      // First sort by significant matches (highest first)
      if (b.significantMatches !== a.significantMatches) {
        return b.significantMatches - a.significantMatches;
      }
      
      // Then sort by max similarity (highest first)
      if (b.maxSimilarity !== a.maxSimilarity) {
        return b.maxSimilarity - a.maxSimilarity;
      }
      
      // If max similarity is the same, sort by match count
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      
      // If both are equal, prioritize academic sources
      if (a.isPriority !== b.isPriority) {
        return a.isPriority ? -1 : 1;
      }
      
      // Finally sort by total (average) similarity
      return b.totalSimilarity - a.totalSimilarity;
    });
  };

  const renderHighlightedContent = () => {
    if (!thesis?.content) return null;

    // Get the content from the thesis
    const fullContent = thesis.content;
    const contentLength = fullContent.length;
    
    // Limit to 2000 characters if content is too long
    const MAX_DISPLAYED_CHARS = 2000;
    const isContentTruncated = contentLength > MAX_DISPLAYED_CHARS;
    const displayContent = isContentTruncated 
      ? fullContent.substring(0, MAX_DISPLAYED_CHARS) 
      : fullContent;
    
    // Arrays to store positions to highlight
    const highlights = [];
    
    // Collect all plagiarism positions (both traditional and AI)
    // Traditional plagiarism from plagiarismDetails
    if (thesis.plagiarismDetails && thesis.plagiarismDetails.length > 0) {
      thesis.plagiarismDetails.forEach(detail => {
        if (detail.startIndex !== undefined && detail.endIndex !== undefined && 
            detail.startIndex < MAX_DISPLAYED_CHARS) {
          
          // Adjust end position if it extends beyond displayed content
          const endIndex = isContentTruncated 
            ? Math.min(detail.endIndex, MAX_DISPLAYED_CHARS) 
            : detail.endIndex;
          
          highlights.push({
            start: detail.startIndex,
            end: endIndex,
            isAi: false,
            similarity: detail.matchPercentage || 0
          });
        }
      });
    }
    
    // AI plagiarism details
    if (thesis.aiPlagiarismDetails && thesis.aiPlagiarismDetails.length > 0) {
      thesis.aiPlagiarismDetails.forEach(detail => {
        if (detail.startIndex !== undefined && detail.endIndex !== undefined && 
            detail.startIndex < MAX_DISPLAYED_CHARS) {
          
          // Adjust end position if it extends beyond displayed content
          const endIndex = isContentTruncated 
            ? Math.min(detail.endIndex, MAX_DISPLAYED_CHARS) 
            : detail.endIndex;
          
          highlights.push({
            start: detail.startIndex,
            end: endIndex,
            isAi: true,
            similarity: detail.aiConfidence || 0
          });
        }
      });
    }
    
    // Process text matches from traditional plagiarism
    if (thesis.textMatches && thesis.textMatches.length > 0) {
      thesis.textMatches.forEach(match => {
        // Make sure we have both position and text content
        if (match.charPositionInThesis !== undefined && match.thesisText && 
            match.charPositionInThesis < MAX_DISPLAYED_CHARS) {
          
          const endIndex = match.charPositionInThesis + match.thesisText.length;
          
          // Adjust end position if beyond display limit
          const adjustedEnd = isContentTruncated 
            ? Math.min(endIndex, MAX_DISPLAYED_CHARS) 
            : endIndex;
          
          // Handle text that's in the displayed portion
          if (match.charPositionInThesis < MAX_DISPLAYED_CHARS) {
            highlights.push({
              start: match.charPositionInThesis,
              end: adjustedEnd,
              isAi: false,
              similarity: match.similarity || 0
            });
            
            // For 100% matches or high similarity, make sure they're fully highlighted
            if (match.similarity >= 90) {
              // Try to find the exact matched text in the displayed content
              const searchText = match.thesisText.substring(0, Math.min(match.thesisText.length, 50));
              const displayLowerCase = displayContent.toLowerCase();
              const searchLowerCase = searchText.toLowerCase();
              
              // Search for all occurrences
              let searchPos = 0;
              while (searchPos < displayContent.length) {
                const foundPos = displayLowerCase.indexOf(searchLowerCase, searchPos);
                if (foundPos === -1) break;
                
                // Add this instance to highlights if not already covered
                const overlapping = highlights.some(h => 
                  (foundPos >= h.start && foundPos <= h.end) ||
                  (foundPos + searchText.length >= h.start && foundPos + searchText.length <= h.end)
                );
                
                if (!overlapping) {
                  highlights.push({
                    start: foundPos,
                    end: foundPos + match.thesisText.length,
                    isAi: false,
                    similarity: match.similarity || 0
                  });
                }
                
                searchPos = foundPos + searchText.length;
              }
            }
          }
        }
      });
    }
    
    // Sort highlights by start position (ascending)
    highlights.sort((a, b) => a.start - b.start);
    
    // Merge overlapping highlights
    const mergedHighlights = [];
    for (const highlight of highlights) {
      if (mergedHighlights.length === 0) {
        mergedHighlights.push(highlight);
        continue;
      }
      
      const lastHighlight = mergedHighlights[mergedHighlights.length - 1];
      
      // If current highlight overlaps with the last one
      if (highlight.start <= lastHighlight.end) {
        // Extend the end position if needed
        if (highlight.end > lastHighlight.end) {
          lastHighlight.end = highlight.end;
        }
        // If current is AI but last is not, prioritize AI highlight
        if (highlight.isAi && !lastHighlight.isAi) {
          lastHighlight.isAi = true;
        }
        // Keep the higher similarity score if available
        if (highlight.similarity > lastHighlight.similarity) {
          lastHighlight.similarity = highlight.similarity;
        }
      } else {
        mergedHighlights.push(highlight);
      }
    }
    
    // Build the highlighted HTML
    let html = '';
    let lastPos = 0;
    
    for (const highlight of mergedHighlights) {
      // Add non-highlighted text before this highlight
      if (highlight.start > lastPos) {
        html += displayContent.substring(lastPos, highlight.start);
      }
      
      // Add the highlighted text with stronger highlighting for high similarity
      const intensityClass = highlight.similarity >= 90 ? 'font-medium' : '';
      const highlightClass = highlight.isAi 
        ? `bg-purple-100 border border-purple-300 rounded-sm ${intensityClass}` 
        : `bg-red-100 border border-red-300 rounded-sm ${intensityClass}`;
      
      const highlightedText = displayContent.substring(highlight.start, highlight.end);
      html += `<span class="${highlightClass}" title="Độ tương đồng: ${highlight.similarity}%">${highlightedText}</span>`;
      
      lastPos = highlight.end;
    }
    
    // Add any remaining text after the last highlight
    if (lastPos < displayContent.length) {
      html += displayContent.substring(lastPos);
    }
    
    // Replace newlines with <br> tags to preserve line breaks
    html = html.replace(/\n/g, '<br>');
    
    return (
      <div className="thesis-content">
        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
        {isContentTruncated && (
          <div className="mt-4 border-t pt-4">
            <p className="text-muted-foreground italic">
              Chỉ hiển thị {MAX_DISPLAYED_CHARS} ký tự đầu tiên (trên tổng số {contentLength} ký tự).
              Vui lòng tải xuống báo cáo đầy đủ để xem toàn bộ nội dung và kết quả phát hiện đạo văn.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Đang tải thông tin luận văn...</p>
        </div>
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy luận văn</h2>
        <p className="text-muted-foreground">
          Luận văn bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{thesis.title}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <p className="text-muted-foreground">Tác giả: {thesis.author?.name || 'Không xác định'}</p>
            <span>•</span>
            <p className="text-muted-foreground">Khoa: {thesis.faculty}</p>
            <span>•</span>
            <p className="text-muted-foreground">
              Ngày tải lên: {new Date(thesis.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div className="mt-2">
            {thesis.status === "processing" && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Đang xử lý
              </Badge>
            )}
            {thesis.status === "completed" && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Hoàn thành
              </Badge>
            )}
            {thesis.status === "rejected" && (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                Bị từ chối
              </Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Button variant="outline" onClick={() => document.getElementById('download-menu')?.classList.toggle('hidden')}>
              Tải xuống
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
            <div id="download-menu" className="hidden absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => handleDownload("traditional")}
                >
                  Tải xuống báo cáo đạo văn Truyền thống
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => handleDownload("ai")}
                >
                  Tải xuống báo cáo đạo văn AI
                </button>
              </div>
            </div>
          </div>
          {(user?.isAdmin || thesis.author?._id === user?._id) && 
            [
              thesis.status !== "processing" && (
                <Button 
                  key="recheck-button"
                  variant="outline" 
                  onClick={handleRecheckPlagiarism}
                  disabled={isRechecking}
                >
                  {isRechecking ? "Đang kiểm tra..." : "Kiểm tra lại đạo văn"}
                </Button>
              ),
              <Button 
                key="delete-button"
                variant="destructive" 
                onClick={handleDelete}
              >
                Xóa luận văn
              </Button>
            ]
          }
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="plagiarism">Báo cáo đạo văn</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt luận văn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{thesis.abstract}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Đạo văn truyền thống</h3>
                  <div className="flex items-center space-x-4">
                    <Progress value={thesis.plagiarismScore} className="h-4" />
                    <span className="text-2xl font-bold">{thesis.plagiarismScore}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {thesis.plagiarismScore > 15 
                      ? "Tỷ lệ đạo văn truyền thống cao, cần xem xét lại nội dung." 
                      : "Tỷ lệ đạo văn truyền thống trong giới hạn cho phép."}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Đạo văn AI</h3>
                  <div className="flex items-center space-x-4">
                    <Progress value={thesis.aiPlagiarismScore} className="h-4" />
                    <span className="text-2xl font-bold">{thesis.aiPlagiarismScore}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {thesis.aiPlagiarismScore > 25 
                      ? "Có dấu hiệu sử dụng AI để tạo nội dung, cần xem xét lại." 
                      : "Không phát hiện nhiều nội dung được tạo bởi AI."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plagiarism" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết đạo văn</CardTitle>
              <CardDescription>
                Danh sách các đoạn văn bản được phát hiện có nội dung trùng lặp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thesis.status === "processing" ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Đang phân tích và kiểm tra đạo văn...</p>
                </div>
              ) : (
                <Tabs defaultValue="traditional" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="traditional" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                      Đạo văn truyền thống
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" x2="9" y1="1" y2="4"/><line x1="15" x2="15" y1="1" y2="4"/><line x1="15" x2="15" y1="20" y2="23"/><line x1="15" x2="15" y1="20" y2="23"/><line x1="20" x2="23" y1="9" y2="9"/><line x1="20" x2="23" y1="14" y2="14"/><line x1="1" x2="4" y1="9" y2="9"/><line x1="1" x2="4" y1="14" y2="14"/></svg>
                      Đạo văn AI
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Tab Đạo văn truyền thống */}
                  <TabsContent value="traditional" className="space-y-6">
                    {thesis.textMatches && thesis.textMatches.length > 0 ? (
                      <div className="space-y-6">
                        {/* Similarity Index */}
                        <div className="p-6 rounded-lg border bg-white">
                          <div className="flex flex-col md:flex-row items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">Similarity Index</h3>
                              <p className="text-muted-foreground text-sm mt-1">
                                {thesis.plagiarismScore < 20
                                  ? "Mức độ trùng lặp thấp"
                                  : thesis.plagiarismScore >= 20 && thesis.plagiarismScore < 40
                                  ? "Mức độ trùng lặp trung bình"
                                  : "Mức độ trùng lặp cao"}
                              </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center shadow-sm">
                                <span className="text-2xl font-bold">
                                  {thesis.plagiarismScore}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Danh sách các đoạn văn bản trùng lặp */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Chi tiết đoạn văn bản trùng lặp</h3>
                          <div className="space-y-6">
                            {thesis.textMatches.map((match, index) => (
                              <div key={index} className="p-4 rounded-md border">
                                <div className="flex flex-col space-y-2">
                                  <div className="flex justify-between">
                                    <h4 className="font-medium">Đoạn {index + 1}</h4>
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                      {match.similarity}% đồng nhất
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-2 font-medium">Đoạn văn trong luận văn:</p>
                                      <div className="p-3 bg-red-50 rounded text-sm">
                                        <p>{match.thesisText}</p>
                                      </div>
                                      {match.pageNumber && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          <span className="font-medium">Vị trí:</span> Trang {match.pageNumber}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-2 font-medium">Đoạn văn từ nguồn:</p>
                                      <div className="p-3 bg-blue-50 rounded text-sm">
                                        <p>{match.sourceText}</p>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        <span className="font-medium">Nguồn:</span> {match.source.title || 'Không xác định'}
                                      </p>
                                      {match.source.author && (
                                        <p className="text-xs text-muted-foreground">
                                          <span className="font-medium">Tác giả:</span> {match.source.author}
                                        </p>
                                      )}
                                      {match.source.url && (
                                        <p className="text-xs text-muted-foreground">
                                          <span className="font-medium">URL:</span> 
                                          <a href={match.source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                            {match.source.url.substring(0, 30)}...
                                          </a>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Danh sách các nguồn trùng lặp */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Các nguồn trùng lặp</h3>
                          <div className="rounded-md border">
                            <table className="w-full">
                              <thead className="bg-slate-50 border-b">
                                <tr>
                                  <th className="py-3 px-4 text-left font-medium text-sm">#</th>
                                  <th className="py-3 px-4 text-left font-medium text-sm">Nguồn</th>
                                  <th className="py-3 px-4 text-left font-medium text-sm">Loại</th>
                                  <th className="py-3 px-4 text-left font-medium text-sm">Tỉ lệ trùng</th>
                                </tr>
                              </thead>
                              <tbody>
                                {thesis.processedSources
                                  ?.slice(0, showAllSources ? thesis.processedSources.length : 5)
                                  .flatMap((source, index) => [
                                  <tr 
                                    key={`source-row-${index}`}
                                    className="border-b hover:bg-muted/50 cursor-pointer" 
                                    onClick={() => {
                                      const expanded = document.getElementById(`source-expand-${index}`);
                                      if (expanded) {
                                        expanded.classList.toggle('hidden');
                                      }
                                    }}
                                  >
                                    <td className="py-4 px-4">{index + 1}</td>
                                    <td className="py-4 px-4">{source.displayName}</td>
                                    <td className="py-4 px-4">{source.type}</td>
                                    <td className="py-4 px-4">{source.totalSimilarity}%</td>
                                  </tr>,
                                  <tr key={`source-details-${index}`} id={`source-expand-${index}`} className="hidden">
                                    <td colSpan={4} className="p-4 bg-slate-50 border-t">
                                      <div className="space-y-4">
                                        <p className="text-muted-foreground">
                                          <span className="font-medium">Tên nguồn:</span> {source.title}
                                        </p>
                                        <p className="text-muted-foreground">
                                          <span className="font-medium">Tác giả:</span> {source.author}
                                        </p>
                                        <p className="text-muted-foreground">
                                          <span className="font-medium">Địa chỉ URL:</span> <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{source.url}</a>
                                        </p>
                                        <p className="text-muted-foreground">
                                          <span className="font-medium">Số đoạn trùng lặp:</span> {source.originalMatches ? source.originalMatches.length : 0} đoạn
                                        </p>
                                        <p className="text-muted-foreground">
                                          <span className="font-medium">Mức độ tương đồng:</span> {source.totalSimilarity}%
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                ])}
                              </tbody>
                            </table>
                            {thesis.processedSources && thesis.processedSources.length > 5 && (
                              <div className="p-4 text-center border-t">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setShowAllSources(!showAllSources)}
                                >
                                  {showAllSources ? "Thu gọn" : `Xem thêm ${thesis.processedSources.length - 5} nguồn`}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Không tìm thấy nguồn trùng lặp nào.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Tab Đạo văn AI */}
                  <TabsContent value="ai" className="space-y-6">
                    {thesis.aiPlagiarismDetails && thesis.aiPlagiarismDetails.length > 0 ? (
                      <div className="space-y-6">
                        {/* AI Similarity Index */}
                        <div className="p-6 rounded-lg border bg-white">
                          <div className="flex flex-col md:flex-row items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">AI Similarity Index</h3>
                              <p className="text-muted-foreground text-sm mt-1">
                                {thesis.aiPlagiarismScore < 20
                                  ? "Mức độ sử dụng AI thấp"
                                  : thesis.aiPlagiarismScore >= 20 && thesis.aiPlagiarismScore < 40
                                  ? "Mức độ sử dụng AI trung bình"
                                  : "Mức độ sử dụng AI cao"}
                              </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center shadow-sm">
                                <span className="text-2xl font-bold">
                                  {thesis.aiPlagiarismScore}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Giải thích phương pháp phát hiện */}
                        <div className="p-6 rounded-lg border bg-white">
                          <h3 className="text-lg font-medium mb-2">Phương pháp phát hiện</h3>
                          <p className="text-sm text-muted-foreground">
                            Hệ thống sử dụng nhiều chỉ số để xác định nội dung AI, bao gồm:
                          </p>
                          <ul className="list-disc ml-5 mt-2 text-sm text-muted-foreground space-y-1">
                            <li>Phân tích độ đa dạng từ vựng (text perplexity)</li>
                            <li>Cấu trúc câu và văn phong nhất quán</li>
                            <li>Mô hình xác suất ngôn ngữ để phát hiện độ kết hợp từ bất thường</li>
                            <li>Phát hiện các dấu hiệu văn bản được tạo bởi mô hình ngôn ngữ lớn</li>
                          </ul>
                        </div>

                        {/* Danh sách các đoạn có dấu hiệu AI */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Các đoạn có dấu hiệu sử dụng AI</h3>
                          <div className="space-y-4">
                            {thesis.aiPlagiarismDetails
                              .map((detail, index) => (
                                <div key={index} className="p-4 rounded-md border">
                                  <div className="flex flex-col space-y-2">
                                    <div className="flex justify-between">
                                      <h4 className="font-medium">Đoạn {index + 1}</h4>
                                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                        {detail.aiConfidence ? `${Math.round(detail.aiConfidence * 100)}%` : '?'} đồng nhất với AI
                                      </span>
                                    </div>
                                    <div className="mt-2 p-3 bg-purple-50 rounded text-sm">
                                      <p>{detail.matchedText}</p>
                                    </div>
                                    <div className="mt-2 p-3 bg-slate-50 rounded text-xs">
                                      <h5 className="font-medium mb-2">Lý do phát hiện:</h5>
                                      <ul className="list-disc ml-5 space-y-1">
                                        <li>Văn phong và cấu trúc câu quá nhất quán</li>
                                        <li>Mức độ đa dạng từ vựng thấp</li>
                                        <li>Sử dụng các công thức và cấu trúc điển hình của AI</li>
                                        {detail.aiConfidence > 0.7 && <li>Độ tin cậy trong phát hiện cao dựa trên phân tích so sánh</li>}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        {/* Gợi ý cải thiện */}
                        <div className="p-6 rounded-lg border bg-blue-50">
                          <h3 className="text-lg font-medium mb-2 text-blue-800">Gợi ý cải thiện</h3>
                          <ul className="list-disc ml-5 mt-2 text-sm text-blue-800 space-y-2">
                            <li>Viết lại các đoạn được đánh dấu bằng ngôn ngữ và văn phong của riêng bạn</li>
                            <li>Thêm trích dẫn và nguồn tham khảo nếu sử dụng AI như một công cụ trợ giúp</li>
                            <li>Sử dụng AI chỉ như một gợi ý ban đầu, sau đó phát triển ý tưởng với cách diễn đạt cá nhân</li>
                            <li>Đa dạng hóa cấu trúc câu và độ dài câu</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-4">
                        <div className="bg-muted p-6 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {thesis.aiPlagiarismScore > 0 ? (
                            <>
                              <p className="text-lg font-medium mb-2">Phát hiện tiềm năng nội dung AI ({thesis.aiPlagiarismScore}%)</p>
                              <p className="text-muted-foreground">
                                Hệ thống đã phát hiện tiềm năng sử dụng AI trong luận văn này, nhưng không xác định được các đoạn văn bản cụ thể.
                                Điều này có thể xảy ra khi nội dung AI được chỉnh sửa đáng kể hoặc được kết hợp với văn bản viết bởi con người.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-lg font-medium mb-2">Không tìm thấy nội dung được tạo bởi AI</p>
                              <p className="text-muted-foreground">
                                Hệ thống không phát hiện các đoạn văn bản có dấu hiệu được tạo bởi công cụ AI trong luận văn này.
                              </p>
                            </>
                          )}
                        </div>
                        
                        {thesis.status === "completed" && (user?.isAdmin || thesis.author?._id === user?._id) && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-700">
                              Phát hiện đạo văn AI có thể không hoàn hảo. Nếu bạn muốn kiểm tra lại, hãy nhấn nút "Kiểm tra lại đạo văn".
                            </p>
                            <Button 
                              variant="outline" 
                              className="mt-2 bg-white"
                              onClick={handleRecheckPlagiarism}
                              disabled={isRechecking}
                            >
                              {isRechecking ? "Đang kiểm tra..." : "Kiểm tra lại đạo văn"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung luận văn</CardTitle>
              <CardDescription>
                Nội dung đầy đủ của luận văn với các đoạn đạo văn được đánh dấu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thesis.content ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-4 bg-red-100 border border-red-300"></div>
                    <span className="text-sm text-muted-foreground">Đạo văn truyền thống</span>
                    <div className="w-4 h-4 bg-purple-100 border border-purple-300 ml-4"></div>
                    <span className="text-sm text-muted-foreground">Đạo văn AI</span>
                  </div>
                  
                  <div className="p-4 border rounded-md whitespace-pre-wrap">
                    {renderHighlightedContent()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Không tìm thấy nội dung luận văn.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThesisView;
