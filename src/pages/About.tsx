import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const About = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Giới thiệu về IUH_PLAGCHECK</h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Hệ thống bảo vệ luận văn thông minh giúp phát hiện đạo văn và nội dung AI
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Về IUH_PLAGCHECK</CardTitle>
            <CardDescription>Nhiệm vụ và tầm nhìn của chúng tôi</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              IUH_PLAGCHECK được phát triển nhằm bảo vệ tính nguyên bản của các luận văn học thuật.
              Hệ thống sử dụng các thuật toán tiên tiến để phát hiện nội dung đạo văn và phát hiện 
              nội dung được tạo bởi AI, giúp đảm bảo tính toàn vẹn học thuật.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tính năng chính</CardTitle>
            <CardDescription>Các công nghệ và tính năng nổi bật</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-gray-500 dark:text-gray-400">
              <li>Phát hiện đạo văn với độ chính xác cao</li>
              <li>Nhận diện nội dung được tạo bởi AI</li>
              <li>Phân tích cấu trúc và chất lượng luận văn</li>
              <li>Báo cáo chi tiết và trực quan</li>
              <li>Hệ thống quản lý dành cho giảng viên và sinh viên</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thuật toán và công nghệ</CardTitle>
            <CardDescription>Các thuật toán và công nghệ tiên tiến được sử dụng trong IUH_PLAGCHECK</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="plagiarism" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plagiarism">Phát hiện đạo văn</TabsTrigger>
                <TabsTrigger value="ai-detection">Phát hiện nội dung AI</TabsTrigger>
              </TabsList>
              <TabsContent value="plagiarism" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hệ thống phát hiện đạo văn</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    IUH_PLAGCHECK sử dụng kết hợp nhiều thuật toán để đảm bảo phát hiện đạo văn một cách hiệu quả và chính xác:
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <h4 className="font-medium">Kỹ thuật so khớp chuỗi Rabin-Karp</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Thuật toán này sử dụng hàm băm (hash function) để so sánh nhanh các đoạn văn bản, giúp phát hiện hiệu quả các đoạn trùng lặp chính xác. Độ phức tạp O(n+m) giúp xử lý nhanh cả tài liệu dài.
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ứng dụng trong IUH_PLAGCHECK:</p>
                        <ul className="text-xs list-disc pl-4 mt-1 text-gray-600 dark:text-gray-300">
                          <li>Quét nhanh toàn bộ luận văn để tìm các đoạn trùng lặp với cơ sở dữ liệu luận văn</li>
                          <li>Kiểm tra chính xác các trích dẫn có được ghi nguồn đầy đủ không</li>
                          <li>Đánh dấu các đoạn trùng lặp dài trong báo cáo chi tiết về đạo văn</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <h4 className="font-medium">Vector không gian ngữ nghĩa (Semantic Space Vectors)</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Biến đổi đoạn văn bản thành các vector trong không gian ngữ nghĩa để so sánh ý nghĩa, không chỉ dừng lại ở cấu trúc câu. Phương pháp này giúp phát hiện đạo văn ngay cả khi người viết đã paraphrase nội dung.
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ứng dụng trong IUH_PLAGCHECK:</p>
                        <ul className="text-xs list-disc pl-4 mt-1 text-gray-600 dark:text-gray-300">
                          <li>Phân tích ngữ nghĩa của các đoạn văn để phát hiện đạo văn được viết lại</li>
                          <li>Hỗ trợ phát hiện đạo văn đa ngôn ngữ thông qua không gian vector chung</li>
                          <li>Được sử dụng trong módun "Kiểm tra tương đồng nội dung" để xác định mức độ tương đồng ý tưởng</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <h4 className="font-medium">Transformers và BERT</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sử dụng các mô hình ngôn ngữ tiên tiến như BERT để hiểu ngữ cảnh và ý nghĩa của văn bản, giúp phát hiện đạo văn khi nội dung đã được viết lại nhưng giữ nguyên ý chính.
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ứng dụng trong IUH_PLAGCHECK:</p>
                        <ul className="text-xs list-disc pl-4 mt-1 text-gray-600 dark:text-gray-300">
                          <li>Phân tích các luận điểm và lập luận chính để tìm các tương đồng về mặt khái niệm</li>
                          <li>Tích hợp trong mô-đun "Phân tích ý tưởng sâu" để đánh giá tính độc đáo của nội dung</li>
                          <li>Phát hiện các trường hợp đạo văn phức tạp khi tác giả sử dụng từ ngữ khác nhưng ý tưởng giống nhau</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <h4 className="font-medium">Thuật toán Smith-Waterman</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Thuật toán so khớp chuỗi cục bộ được điều chỉnh cho văn bản, giúp tìm ra các đoạn tương đồng ngay cả khi có sự thay đổi, thêm bớt từ ngữ.
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ứng dụng trong IUH_PLAGCHECK:</p>
                        <ul className="text-xs list-disc pl-4 mt-1 text-gray-600 dark:text-gray-300">
                          <li>Được sử dụng trong tính năng "So sánh đoạn văn chi tiết" để tìm các phần tương đồng một cách chính xác</li>
                          <li>Tạo các báo cáo chi tiết về các đoạn văn được sửa đổi nhẹ từ nguồn gốc</li>
                          <li>Hỗ trợ xác định mức độ chỉnh sửa cần thiết để biến nội dung đạo văn thành nội dung gốc</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">Quy trình kiểm tra đạo văn</h4>
                    <div className="grid gap-3 md:grid-cols-4 mt-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-2">1</div>
                        <h5 className="text-sm font-medium">Quét ban đầu</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sử dụng Rabin-Karp để quét nhanh toàn bộ tài liệu, xác định các vùng cần phân tích kỹ hơn.</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-2">2</div>
                        <h5 className="text-sm font-medium">Phân tích ngữ nghĩa</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Áp dụng Vector không gian ngữ nghĩa và BERT để phân tích sâu hơn về mặt ngữ nghĩa của nội dung.</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-2">3</div>
                        <h5 className="text-sm font-medium">So khớp chi tiết</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sử dụng Smith-Waterman để phân tích chính xác những đoạn đã được xác định là có khả năng đạo văn.</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-2">4</div>
                        <h5 className="text-sm font-medium">Tạo báo cáo</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kết hợp kết quả từ tất cả các thuật toán để tạo báo cáo chi tiết với các đề xuất cụ thể.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                    <h4 className="font-medium text-green-700 dark:text-green-400">So sánh với các giải pháp kiểm tra đạo văn phổ biến</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Các thuật toán được sử dụng trong IUH_PLAGCHECK cũng được áp dụng trong nhiều phần mềm kiểm tra đạo văn chuyên nghiệp hàng đầu:
                    </p>
                    <div className="grid gap-4 md:grid-cols-3 mt-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <h5 className="text-sm font-medium flex items-center">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 text-xs mr-2">T</span>
                          Turnitin
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sử dụng thuật toán tương tự Rabin-Karp để tạo fingerprint văn bản và thuật toán so sánh chuỗi tiên tiến để phát hiện tương đồng. IUH_PLAGCHECK áp dụng phương pháp tương tự, nhưng đã được tối ưu hóa cho tài liệu tiếng Việt.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <h5 className="text-sm font-medium flex items-center">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 text-xs mr-2">C</span>
                          Copyscape
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sử dụng phương pháp Semantic Space Vectors tương tự để phát hiện sao chép nội dung. IUH_PLAGCHECK sử dụng kỹ thuật tương tự nhưng tích hợp các mô hình ngôn ngữ đặc biệt cho tiếng Việt để tăng độ chính xác.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <h5 className="text-sm font-medium flex items-center">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 text-xs mr-2">G</span>
                          Grammarly
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sử dụng các mô hình BERT để phân tích nội dung. IUH_PLAGCHECK cũng áp dụng các mô hình Transformer tương tự, với điểm khác biệt là đã được tinh chỉnh đặc biệt cho luận văn học thuật tiếng Việt.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                      Mặc dù các thuật toán cơ bản có điểm tương đồng, IUH_PLAGCHECK đã được tối ưu hóa đặc biệt cho tiếng Việt và các tài liệu học thuật, giúp tăng cường khả năng phát hiện đạo văn trong luận văn của sinh viên Việt Nam.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="ai-detection" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hệ thống phát hiện nội dung tạo bởi AI</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    IUH_PLAGCHECK tích hợp các công nghệ tiên tiến để phát hiện nội dung được tạo bởi các mô hình ngôn ngữ lớn như GPT:
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <h4 className="font-medium">Mô hình phân loại RoBERTa</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sử dụng mô hình RoBERTa được tinh chỉnh đặc biệt để phân biệt giữa văn bản do con người viết và văn bản do AI tạo ra, với độ chính xác trên 95% trong nhiều ngữ cảnh khác nhau.
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ứng dụng trong IUH_PLAGCHECK:</p>
                        <ul className="text-xs list-disc pl-4 mt-1 text-gray-600 dark:text-gray-300">
                          <li>Phân tích các đoạn văn để xác định nguồn gốc của nội dung</li>
                          <li>Đánh giá mức độ tương đồng giữa văn bản và nội dung được tạo bởi AI</li>
                          <li>Cung cấp báo cáo chi tiết về khả năng nội dung được tạo bởi AI</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <h4 className="font-medium">Thống kê perplexity</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phân tích mức độ "bất ngờ" của văn bản thông qua chỉ số perplexity. Văn bản AI thường có perplexity thấp hơn và độ nhất quán cao hơn so với văn bản của con người.
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ứng dụng trong IUH_PLAGCHECK:</p>
                        <ul className="text-xs list-disc pl-4 mt-1 text-gray-600 dark:text-gray-300">
                          <li>Đánh giá mức độ phức tạp của văn bản để xác định khả năng được tạo bởi AI</li>
                          <li>So sánh mức độ perplexity của văn bản với cơ sở dữ liệu để xác định nguồn gốc</li>
                          <li>Cung cấp báo cáo chi tiết về mức độ phức tạp của văn bản</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <h4 className="font-medium">Phân tích entropy và tính đa dạng từ vựng</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Đo lường độ đa dạng từ vựng và entropy của văn bản, vì nội dung AI thường có mô hình thống kê khác biệt so với văn bản con người viết.
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ứng dụng trong IUH_PLAGCHECK:</p>
                        <ul className="text-xs list-disc pl-4 mt-1 text-gray-600 dark:text-gray-300">
                          <li>Đánh giá mức độ đa dạng từ vựng của văn bản để xác định khả năng được tạo bởi AI</li>
                          <li>So sánh mức độ entropy của văn bản với cơ sở dữ liệu để xác định nguồn gốc</li>
                          <li>Cung cấp báo cáo chi tiết về mức độ đa dạng từ vựng của văn bản</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <h4 className="font-medium">Detectors dựa trên watermark</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phát hiện các watermark vô hình mà một số mô hình AI nhúng vào đầu ra, như các mô hình phân phối token đặc biệt hoặc các pattern ẩn.
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ứng dụng trong IUH_PLAGCHECK:</p>
                        <ul className="text-xs list-disc pl-4 mt-1 text-gray-600 dark:text-gray-300">
                          <li>Phát hiện các watermark vô hình trong văn bản để xác định khả năng được tạo bởi AI</li>
                          <li>So sánh các pattern ẩn trong văn bản với cơ sở dữ liệu để xác định nguồn gốc</li>
                          <li>Cung cấp báo cáo chi tiết về các watermark vô hình trong văn bản</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">Quy trình phát hiện nội dung AI</h4>
                    <div className="grid gap-3 md:grid-cols-4 mt-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-2">1</div>
                        <h5 className="text-sm font-medium">Phân đoạn văn bản</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chia luận văn thành các đoạn nhỏ để phân tích riêng biệt, tăng độ chính xác phát hiện.</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-2">2</div>
                        <h5 className="text-sm font-medium">Đánh giá thống kê</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Phân tích perplexity và entropy của từng đoạn, so sánh với chuẩn thống kê của văn bản tự nhiên.</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-2">3</div>
                        <h5 className="text-sm font-medium">Phân loại nội dung</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sử dụng mô hình RoBERTa để phân loại từng đoạn, xác định xác suất nội dung AI.</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-2">4</div>
                        <h5 className="text-sm font-medium">Phân tích tổng hợp</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kết hợp kết quả từ các phương pháp để đưa ra đánh giá cuối cùng và báo cáo chi tiết.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400">Ứng dụng thực tế trong IUH_PLAGCHECK</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Hệ thống phát hiện nội dung AI của IUH_PLAGCHECK được áp dụng trong các tình huống sau:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-xs">✓</span>
                        <span><strong>Kiểm tra tổng thể:</strong> Đánh giá tỷ lệ nội dung AI trong toàn bộ luận văn, hiển thị trong báo cáo tổng quan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-xs">✓</span>
                        <span><strong>Kiểm tra từng phần:</strong> Đánh dấu các đoạn văn cụ thể có khả năng được tạo bởi AI cao, giúp giáo viên kiểm tra kỹ hơn</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-xs">✓</span>
                        <span><strong>Đề xuất chỉnh sửa:</strong> Cung cấp hướng dẫn cụ thể về cách chỉnh sửa nội dung AI để phù hợp hơn với yêu cầu học thuật</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-xs">✓</span>
                        <span><strong>Báo cáo mức độ nghiêm trọng:</strong> Đánh giá mức độ sử dụng AI và tác động đến tính nguyên bản của luận văn</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">So sánh với các giải pháp phát hiện nội dung AI phổ biến</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Các công nghệ được sử dụng trong IUH_PLAGCHECK có điểm tương đồng với các công cụ phát hiện nội dung AI nổi tiếng khác:
                    </p>
                    <div className="grid gap-4 md:grid-cols-3 mt-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <h5 className="text-sm font-medium flex items-center">
                          <span className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs mr-2">G</span>
                          GPTZero
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sử dụng phương pháp phân tích perplexity và burstiness để phát hiện nội dung AI. IUH_PLAGCHECK áp dụng phương pháp tương tự, cùng với các thuật toán đặc biệt cho tiếng Việt để tăng độ chính xác.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <h5 className="text-sm font-medium flex items-center">
                          <span className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs mr-2">O</span>
                          OpenAI Text Classifier
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sử dụng mô hình RoBERTa để phân loại văn bản. IUH_PLAGCHECK tích hợp mô hình tương tự nhưng đã được huấn luyện đặc biệt với dữ liệu luận văn tiếng Việt để nhận diện chính xác hơn.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                        <h5 className="text-sm font-medium flex items-center">
                          <span className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs mr-2">Z</span>
                          ZeroGPT
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Phân tích các pattern ngôn ngữ và cách sử dụng từ vựng. IUH_PLAGCHECK mở rộng phương pháp này với công nghệ phân tích entropy và đa dạng từ vựng cho tiếng Việt.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                      IUH_PLAGCHECK không chỉ áp dụng các thuật toán hiện đại mà còn tích hợp nhiều kỹ thuật phát hiện khác nhau, tạo hệ thống đánh giá đa chiều để xác định chính xác nội dung được tạo bởi AI trong luận văn tiếng Việt.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Đội ngũ phát triển</CardTitle>
            <CardDescription>Những người đứng sau IUH_PLAGCHECK</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">NV</span>
              </div>
              <h3 className="font-medium">Bùi Đức Hải</h3>
              <p className="text-sm text-gray-500">Trưởng nhóm phát triển</p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">TT</span>
              </div>
              <h3 className="font-medium">Lê Trung Hân</h3>
              <p className="text-sm text-gray-500">Chuyên gia NLP</p>
            </div>
            {/* <div className="flex flex-col items-center space-y-2 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">LV</span>
              </div>
              <h3 className="font-medium">Lê Văn C</h3>
              <p className="text-sm text-gray-500">Kỹ sư AI</p>
            </div> */}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Liên hệ</CardTitle>
            <CardDescription>Thông tin liên hệ của chúng tôi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-500 dark:text-gray-400">
                Nếu bạn có bất kỳ câu hỏi hoặc đề xuất nào, hãy liên hệ với chúng tôi:
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>buiduchai276@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>(+84) 369876559</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
