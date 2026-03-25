import { Link } from "react-router-dom";
import { HiMail } from "react-icons/hi";
import { FaGithub, FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Heart, ArrowUpRight, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook", color: "hover:text-blue-500" },
    { icon: FaTwitter, href: "#", label: "Twitter", color: "hover:text-sky-500" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
    { icon: FaYoutube, href: "#", label: "YouTube", color: "hover:text-red-500" },
    { icon: FaGithub, href: "#", label: "GitHub", color: "hover:text-slate-900" },
  ];

  const quickLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Giới thiệu", href: "/about" },
    { label: "Liên hệ", href: "/contact" },
    { label: "Chính sách bảo mật", href: "/privacy" },
  ];

  const categories = [
    { label: "AI & ChatGPT", href: "/category/ai" },
    { label: "Make.com", href: "/category/make" },
    { label: "N8N", href: "/category/n8n" },
    { label: "Tips & Tricks", href: "/category/tips" },
  ];

  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Go Blog
                </h2>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Blog chia sẻ về ứng dụng AI vào thực tiễn, tự động hóa quy trình 
                với Make.com và N8N. Giúp bạn làm việc thông minh hơn.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Liên kết
              </h3>
              <ul className="space-y-4">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Danh mục
              </h3>
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat.label}>
                    <Link
                      to={cat.href}
                      className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {cat.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Liên hệ
              </h3>
              <div className="space-y-4 mb-8">
                <a
                  href="mailto:contact@goblog.dev"
                  className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <HiMail className="w-5 h-5" />
                  </div>
                  <span>contact@goblog.dev</span>
                </a>
              </div>

              {/* Social Links */}
              <div>
                <p className="text-sm text-slate-400 mb-4">Theo dõi chúng tôi</p>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={`w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 ${social.color} transition-all hover:scale-110`}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400 flex items-center gap-1">
                © {currentYear} Go Blog. Made with 
                <Heart className="w-4 h-4 text-red-500 fill-red-500" /> 
                in Vietnam
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <Link to="/terms" className="hover:text-white transition-colors">
                  Điều khoản
                </Link>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Bảo mật
                </Link>
                <Link to="/sitemap" className="hover:text-white transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
