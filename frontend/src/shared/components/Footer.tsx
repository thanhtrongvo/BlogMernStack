import { Link } from "react-router-dom";
import { HiMail } from "react-icons/hi";
import { FaGithub, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook" },
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
    { icon: FaGithub, href: "#", label: "GitHub" },
  ];

  const quickLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Giới thiệu", href: "/about" },
    { label: "Liên hệ", href: "/contact" },
  ];

  const categories = [
    { label: "Tin Tức", href: "/category/tin-tuc-69cbbd742be03fe0c383f064" },
    { label: "Học Tập", href: "/category/hoc-tap-69cbbd742be03fe0c383f061" },
    { label: "Thủ Thuật", href: "/category/thu-thuat-69cbbd742be03fe0c383f062" },
    { label: "Kể Chuyện", href: "/category/ke-chuyen-69cbbd742be03fe0c383f063" },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4 group flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg leading-none">G</span>
              </div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Go Blog</h2>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Nền tảng chia sẻ kiến thức công nghệ, thủ thuật hữu ích và cập nhật tin tức công nghệ mới nhất.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Liên kết
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Danh mục
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.label}>
                  <Link
                    to={cat.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Liên hệ
            </h3>
            <a
              href="mailto:contact@goblog.dev"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <HiMail className="w-4 h-4" />
              contact@goblog.dev
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© {currentYear} Go Blog. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-white transition-colors">
                Điều khoản
              </Link>
              <Link to="/privacy" className="hover:text-white transition-colors">
                Bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
