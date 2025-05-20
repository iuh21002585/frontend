import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from './dateUtils';
import { addWatermark, addFooter, addHeader } from './pdfUtils';

// Function to generate PDF from HTML element with enhanced features
export const generatePDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Create canvas from the HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add subsequent pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Add title based on filename
    const title = filename.includes('AI') ? 'Báo Cáo Phát Hiện Đạo Văn AI' : 'Báo Cáo Phát Hiện Đạo Văn Truyền Thống';
    
    // Add header, footer, and watermark
    addHeader(pdf, title);
    addFooter(pdf);
    addWatermark(pdf, 'IUH PLAGCHECK');
    
    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Function to generate a traditional plagiarism report
export const generateTraditionalReport = (thesis: any): HTMLElement => {
  // Create a hidden div to render the report
  const reportContainer = document.createElement('div');
  reportContainer.style.width = '794px'; // Approximately A4 width
  reportContainer.style.padding = '40px';
  reportContainer.style.fontFamily = 'Arial, sans-serif';
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  reportContainer.style.backgroundColor = 'white';
  
  // Create report content
  reportContainer.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 10px;">IUH PLAGCHECK</h1>
        <h2 style="font-size: 22px; margin-bottom: 5px;">Báo Cáo Phát Hiện Đạo Văn</h2>
        <p style="color: #6b7280; font-style: italic;">Loại: Truyền thống</p>
        <p style="color: #6b7280;">Ngày tạo: ${formatDate(new Date())}</p>
      </div>
      
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">Thông tin luận văn</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 30%; color: #6b7280;">Tiêu đề:</td>
            <td style="padding: 8px 0; font-weight: 500;">${thesis.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tác giả:</td>
            <td style="padding: 8px 0;">${thesis.author?.name || 'Không xác định'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Khoa:</td>
            <td style="padding: 8px 0;">${thesis.faculty || 'Không xác định'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Ngày tải lên:</td>
            <td style="padding: 8px 0;">${new Date(thesis.createdAt).toLocaleDateString("vi-VN")}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
          <h3 style="font-size: 18px; margin: 0; color: #1f2937;">Similarity Index</h3>
          <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <span style="font-size: 20px; font-weight: bold; color: ${
              thesis.plagiarismScore < 20 ? '#10b981' : 
              thesis.plagiarismScore < 40 ? '#f59e0b' : 
              '#ef4444'
            };">${thesis.plagiarismScore}%</span>
          </div>
        </div>
        <p style="color: #6b7280; margin-top: 10px;">
          ${thesis.plagiarismScore < 20
            ? "Mức độ trùng lặp thấp. Đạt yêu cầu."
            : thesis.plagiarismScore >= 20 && thesis.plagiarismScore < 40
            ? "Mức độ trùng lặp trung bình. Cần xem xét lại một số đoạn văn."
            : "Mức độ trùng lặp cao. Cần chỉnh sửa đáng kể."}
        </p>
      </div>
      
      ${thesis.processedSources && thesis.processedSources.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">Các nguồn trùng lặp chính</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">#</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Nguồn</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Loại</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Tỉ lệ trùng</th>
              </tr>
            </thead>
            <tbody>
              ${thesis.processedSources.map((source, index) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px;">${index + 1}</td>
                  <td style="padding: 12px;">${source.displayName}</td>
                  <td style="padding: 12px;">${source.type}</td>
                  <td style="padding: 12px; font-weight: 500;">${source.totalSimilarity}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${thesis.textMatches && thesis.textMatches.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">Chi tiết đoạn văn bản trùng lặp</h3>
          <div>
            ${thesis.textMatches.slice(0, 10).map((match, index) => `
              <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <h4 style="margin: 0; font-size: 16px;">Đoạn ${index + 1}</h4>
                  <span style="background-color: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${match.similarity}% đồng nhất
                  </span>
                </div>
                
                <div style="display: flex; gap: 20px; margin-top: 10px;">
                  <div style="flex: 1;">
                    <p style="font-size: 12px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">Đoạn văn trong luận văn:</p>
                    <div style="padding: 10px; background-color: #fee2e2; border-radius: 4px; font-size: 13px;">
                      <p style="margin: 0;">${match.thesisText}</p>
                    </div>
                    ${match.pageNumber ? `
                      <p style="font-size: 12px; color: #6b7280; margin-top: 6px;">
                        <span style="font-weight: 500;">Vị trí:</span> Trang ${match.pageNumber}
                      </p>
                    ` : ''}
                  </div>
                  
                  <div style="flex: 1;">
                    <p style="font-size: 12px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">Đoạn văn từ nguồn:</p>
                    <div style="padding: 10px; background-color: #dbeafe; border-radius: 4px; font-size: 13px;">
                      <p style="margin: 0;">${match.sourceText}</p>
                    </div>
                    <p style="font-size: 12px; color: #6b7280; margin-top: 6px;">
                      <span style="font-weight: 500;">Nguồn:</span> ${match.source.title || 'Không xác định'}
                    </p>
                    ${match.source.author ? `
                      <p style="font-size: 12px; color: #6b7280;">
                        <span style="font-weight: 500;">Tác giả:</span> ${match.source.author}
                      </p>
                    ` : ''}
                    ${match.source.url ? `
                      <p style="font-size: 12px; color: #6b7280;">
                        <span style="font-weight: 500;">URL:</span> ${match.source.url}
                      </p>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>© ${new Date().getFullYear()} IUH PLAGCHECK - Hệ thống kiểm tra đạo văn</p>
        <p>Báo cáo này được tạo tự động và chỉ mang tính tham khảo.</p>
      </div>
    </div>
  `;
  
  // Add to document body temporarily for rendering
  document.body.appendChild(reportContainer);
  
  return reportContainer;
};

// Function to generate an AI plagiarism report
export const generateAIReport = (thesis: any): HTMLElement => {
  // Create a hidden div to render the report
  const reportContainer = document.createElement('div');
  reportContainer.style.width = '794px'; // Approximately A4 width
  reportContainer.style.padding = '40px';
  reportContainer.style.fontFamily = 'Arial, sans-serif';
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  reportContainer.style.backgroundColor = 'white';
  
  // Create report content
  reportContainer.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 10px;">IUH PLAGCHECK</h1>
        <h2 style="font-size: 22px; margin-bottom: 5px;">Báo Cáo Phát Hiện Nội Dung AI</h2>
        <p style="color: #6b7280; font-style: italic;">Loại: Phát hiện nội dung AI</p>
        <p style="color: #6b7280;">Ngày tạo: ${formatDate(new Date())}</p>
      </div>
      
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">Thông tin luận văn</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 30%; color: #6b7280;">Tiêu đề:</td>
            <td style="padding: 8px 0; font-weight: 500;">${thesis.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tác giả:</td>
            <td style="padding: 8px 0;">${thesis.author?.name || 'Không xác định'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Khoa:</td>
            <td style="padding: 8px 0;">${thesis.faculty || 'Không xác định'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Ngày tải lên:</td>
            <td style="padding: 8px 0;">${new Date(thesis.createdAt).toLocaleDateString("vi-VN")}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
          <h3 style="font-size: 18px; margin: 0; color: #1f2937;">AI Content Index</h3>
          <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <span style="font-size: 20px; font-weight: bold; color: ${
              thesis.aiPlagiarismScore < 20 ? '#10b981' : 
              thesis.aiPlagiarismScore < 40 ? '#f59e0b' : 
              '#ef4444'
            };">${thesis.aiPlagiarismScore}%</span>
          </div>
        </div>
        <p style="color: #6b7280; margin-top: 10px;">
          ${thesis.aiPlagiarismScore < 20
            ? "Mức độ sử dụng AI thấp. Đạt yêu cầu."
            : thesis.aiPlagiarismScore >= 20 && thesis.aiPlagiarismScore < 40
            ? "Mức độ sử dụng AI trung bình. Cần xem xét lại một số đoạn văn."
            : "Mức độ sử dụng AI cao. Cần chỉnh sửa đáng kể."}
        </p>
      </div>
      
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">Phương pháp phát hiện</h3>
        <p style="color: #6b7280; margin-bottom: 10px;">
          Hệ thống sử dụng nhiều chỉ số để xác định nội dung AI, bao gồm:
        </p>
        <ul style="color: #6b7280; padding-left: 20px; margin-top: 5px;">
          <li style="margin-bottom: 5px;">Phân tích độ đa dạng từ vựng (text perplexity)</li>
          <li style="margin-bottom: 5px;">Cấu trúc câu và văn phong nhất quán</li>
          <li style="margin-bottom: 5px;">Mô hình xác suất ngôn ngữ để phát hiện độ kết hợp từ bất thường</li>
          <li style="margin-bottom: 5px;">Phát hiện các dấu hiệu văn bản được tạo bởi mô hình ngôn ngữ lớn</li>
        </ul>
      </div>
      
      ${thesis.aiPlagiarismDetails && thesis.aiPlagiarismDetails.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">Các đoạn có dấu hiệu sử dụng AI</h3>
          <div>
            ${thesis.aiPlagiarismDetails.map((detail, index) => `
              <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <h4 style="margin: 0; font-size: 16px;">Đoạn ${index + 1}</h4>
                  <span style="background-color: #ede9fe; color: #6d28d9; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${detail.aiConfidence ? `${Math.round(detail.aiConfidence * 100)}%` : '?'} đồng nhất với AI
                  </span>
                </div>
                
                <div style="margin-top: 10px; padding: 10px; background-color: #f5f3ff; border-radius: 4px; font-size: 13px;">
                  <p style="margin: 0;">${detail.matchedText}</p>
                </div>
                
                <div style="margin-top: 10px; padding: 10px; background-color: #f9fafb; border-radius: 4px; font-size: 12px;">
                  <h5 style="margin-top: 0; margin-bottom: 8px; font-size: 14px;">Lý do phát hiện:</h5>
                  <ul style="padding-left: 20px; margin-top: 5px; color: #6b7280;">
                    <li style="margin-bottom: 3px;">Văn phong và cấu trúc câu quá nhất quán</li>
                    <li style="margin-bottom: 3px;">Mức độ đa dạng từ vựng thấp</li>
                    <li style="margin-bottom: 3px;">Sử dụng các công thức và cấu trúc điển hình của AI</li>
                    ${detail.aiConfidence > 0.7 ? `<li style="margin-bottom: 3px;">Độ tin cậy trong phát hiện cao dựa trên phân tích so sánh</li>` : ''}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div style="text-align: center; padding: 30px; background-color: #f9fafb; border-radius: 8px;">
          ${thesis.aiPlagiarismScore > 0 ? `
            <p style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">Phát hiện tiềm năng nội dung AI (${thesis.aiPlagiarismScore}%)</p>
            <p style="color: #6b7280;">
              Hệ thống đã phát hiện tiềm năng sử dụng AI trong luận văn này, nhưng không xác định được các đoạn văn bản cụ thể.
              Điều này có thể xảy ra khi nội dung AI được chỉnh sửa đáng kể hoặc được kết hợp với văn bản viết bởi con người.
            </p>
          ` : `
            <p style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">Không tìm thấy nội dung được tạo bởi AI</p>
            <p style="color: #6b7280;">
              Hệ thống không phát hiện các đoạn văn bản có dấu hiệu được tạo bởi công cụ AI trong luận văn này.
            </p>
          `}
        </div>
      `}
      
      <div style="margin-top: 30px; padding: 20px; border: 1px solid #ddd7fe; border-radius: 8px; background-color: #f5f3ff;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: #6d28d9;">Gợi ý cải thiện</h3>
        <ul style="padding-left: 20px; color: #7c3aed;">
          <li style="margin-bottom: 8px;">Viết lại các đoạn được đánh dấu bằng ngôn ngữ và văn phong của riêng bạn</li>
          <li style="margin-bottom: 8px;">Thêm trích dẫn và nguồn tham khảo nếu sử dụng AI như một công cụ trợ giúp</li>
          <li style="margin-bottom: 8px;">Sử dụng AI chỉ như một gợi ý ban đầu, sau đó phát triển ý tưởng với cách diễn đạt cá nhân</li>
          <li style="margin-bottom: 8px;">Đa dạng hóa cấu trúc câu và độ dài câu</li>
        </ul>
      </div>
      
      <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>© ${new Date().getFullYear()} IUH PLAGCHECK - Hệ thống kiểm tra đạo văn</p>
        <p>Báo cáo này được tạo tự động và chỉ mang tính tham khảo.</p>
      </div>
    </div>
  `;
  
  // Add to document body temporarily for rendering
  document.body.appendChild(reportContainer);
  
  return reportContainer;
};
