import { Search, Sparkles, Zap, Bot } from "lucide-react";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";

const HeroBanner = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentWord, setCurrentWord] = useState(0);
  
  const words = ["AI", "Make.com", "N8N", "Automation"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-white/90 text-sm font-medium">Blog về công nghệ & tự động hóa</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Khám phá thế giới
          <br />
          <span className="relative">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {words[currentWord]}
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-50" />
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Chia sẻ kiến thức về ứng dụng AI vào thực tiễn, tự động hóa quy trình 
          với Make.com và N8N. Những mẹo, thủ thuật giúp bạn làm việc hiệu quả hơn.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
              <Input 
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-14 bg-transparent border-0 text-white placeholder:text-white/50 pl-6 pr-4 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
              />
              <button
                type="submit"
                className="h-14 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </button>
            </div>
          </div>
        </form>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">AI & ChatGPT</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Automation</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Tips & Tricks</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
