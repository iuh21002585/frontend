/**
 * Utility functions to help customize PDF reports
 */

// Logo for PDF header
export const logoBase64 = 'data:image/png;base64,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';

// Function to generate a watermark on each page
export const addWatermark = (pdf: any, text: string) => {
  const totalPages = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(30);
    pdf.setFont('helvetica', 'italic');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.text(text, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
      opacity: 0.3
    });
  }
};

// Function to add a footer with page numbers
export const addFooter = (pdf: any) => {
  const totalPages = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const text = `Trang ${i} / ${totalPages}`;
    const textWidth = pdf.getStringUnitWidth(text) * 10 / pdf.internal.scaleFactor;
    
    pdf.text(text, pageWidth / 2 - textWidth / 2, pageHeight - 10);
    pdf.text(`IUH PLAGCHECK - Báo cáo được tạo tự động ngày ${new Date().toLocaleDateString('vi-VN')}`, 15, pageHeight - 10);
  }
};

// Function to add a header with logo
export const addHeader = (pdf: any, title: string) => {
  const totalPages = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Add logo
    try {
      pdf.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
    } catch (error) {
      console.error('Failed to add logo:', error);
    }
    
    // Add title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.text(title, 40, 20);
    
    // Add horizontal line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(15, 35, pageWidth - 15, 35);
  }
};
