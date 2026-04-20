import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="px-8 pb-12">
              <div className="relative -mt-20 mb-8 flex justify-center">
                <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full flex items-center justify-center border-4 border-slate-50">
                    <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600">G</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Về Go Blog</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Nền tảng chia sẻ kiến thức, tin tức công nghệ và thủ thuật hữu ích dành cho cộng đồng.
                </p>
              </div>

              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-500">
                <h3>Sứ mệnh của chúng tôi</h3>
                <p>
                  Trong thời đại kỷ nguyên số phát triển với tốc độ vũ bão, việc nắm bắt thông tin và làm chủ công nghệ là chìa khóa để vươn tới thành công. Go Blog được sinh ra với sứ mệnh trở thành cầu nối mang những kiến thức công nghệ phức tạp đến gần hơn với mọi người qua những bài viết dễ hiểu, trực quan và có tính ứng dụng cao.
                </p>
                
                <h3>Nội dung tập trung</h3>
                <p>Chúng tôi cung cấp các bài viết chuyên sâu về các lĩnh vực:</p>
                <ul>
                  <li><strong>Tin Tức:</strong> Cập nhật các xu hướng công nghệ mới nhất, các sự kiện nóng hổi trong thế giới số.</li>
                  <li><strong>Thủ Thuật:</strong> Những mẹo hay, hướng dẫn từng bước giúp tối ưu hóa công việc và cuộc sống.</li>
                  <li><strong>Học Tập:</strong> Nguồn tài liệu lập trình, thiết kế, quản trị hệ thống chất lượng cao.</li>
                  <li><strong>Kể Chuyện:</strong> Những câu chuyện truyền cảm hứng, góc nhìn và trải nghiệm từ những người đi trước.</li>
                </ul>

                <h3>Công nghệ tự động</h3>
                <p>
                  Điểm đặc biệt của Go Blog là việc ứng dụng trí tuệ nhân tạo (AI) và các hệ thống tự động hóa tiên tiến để thu thập, tổng hợp và biên tập nội dung. Điều này giúp chúng tôi luôn duy trì được một lượng bài viết phong phú, chất lượng cao và cập nhật liên tục 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
