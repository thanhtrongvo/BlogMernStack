import { Search, ArrowRight } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";

const HeroBanner = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="relative bg-white py-20 md:py-28 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-slate-600 text-sm font-medium">Blog về công nghệ & tự động hóa</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
          Chia sẻ kiến thức
          <br />
          <span className="text-blue-600">AI & Automation</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Ứng dụng AI vào thực tiễn, tự động hóa quy trình với 
          <span className="font-semibold text-slate-800"> Make.com </span>và
          <span className="font-semibold text-slate-800"> N8N</span>. 
          Những mẹo giúp bạn làm việc hiệu quả hơn.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto mb-10">
          <div className="relative">
            <Input 
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-5 pr-14 rounded-full border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-0 shadow-sm hover:border-slate-300 transition-colors" 
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: "AI & ChatGPT", href: "/category/ai" },
            { label: "Make.com", href: "/category/make" },
            { label: "N8N", href: "/category/n8n" },
            { label: "Tips & Tricks", href: "/category/tips" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="group flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full text-sm font-medium transition-colors"
            >
              {item.label}
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
