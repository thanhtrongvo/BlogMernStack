import { useState } from "react";
import { Mail, Send, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Đăng ký nhận bài viết mới
        </h2>

        {/* Description */}
        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
          Nhận thông báo về các bài viết mới nhất về AI, tự động hóa và những mẹo 
          hữu ích ngay trong hộp thư của bạn. Không spam, hủy bất cứ lúc nào.
        </p>

        {/* Form */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 px-4 py-3 focus:outline-none"
                />
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-indigo-600 hover:bg-white/90 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Đăng ký</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-4">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <span className="text-white font-medium">
              Cảm ơn bạn đã đăng ký! Kiểm tra email nhé.
            </span>
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Nội dung độc quyền</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Miễn phí 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>1-2 email/tuần</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
