import { HiMail } from "react-icons/hi";
import { FaGithub, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Button } from "./ui/button";

const Footer = () => {
  // Năm hiện tại cho copyright
  const currentYear = new Date().getFullYear();

  return (
        <footer className="bg-gradient-to-b from-gray-200 to-gray-300 pt-12 pb-8 border-t border-gray-300 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - Thông tin về blog */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Go Dev Blog</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Blog chia sẻ về ứng dụng AI vào thực tiễn; tự động hóa quy trình với Make.com và N8N.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <FaFacebook size={18} />
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-700 transition-colors">
                <FaLinkedin size={18} />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          {/* Column 2 - Liên kết chính */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Học Tập
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Thủ Thuật
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Kể Chuyện
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Tin Tức
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Blog nổi bật */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Bài viết nổi bật</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Hướng dẫn đăng kí Cursor miễn phí 1 năm
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Tự động hóa với Make.com
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Ứng dụng AI vào công việc hàng ngày
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Workflow tự động với N8N
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Liên hệ và đăng ký */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Liên hệ & Đăng ký</h3>
            <p className="text-sm text-gray-600">
              Nhận thông báo về các bài viết mới nhất của chúng tôi.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-grow px-3 py-2 text-sm border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
              />
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Đăng ký
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <HiMail size={16} />
              <span>contact@godev.blog</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-400 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} Go Dev Blog. Tất cả các quyền được bảo lưu.
            </p>
            <div className="mt-4 md:mt-0 space-x-4 text-sm">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                Điều khoản dịch vụ
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                Chính sách bảo mật
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
