import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-6">
          <Mail className="w-7 h-7 text-blue-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Đăng ký nhận bài viết mới
        </h2>

        {/* Description */}
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Nhận thông báo về các bài viết mới nhất. Không spam, hủy bất cứ lúc nào.
        </p>

        {/* Form */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="h-12 px-6 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Đăng ký
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3">
            <Check className="w-5 h-5" />
            <span className="font-medium">Cảm ơn bạn đã đăng ký!</span>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex justify-center gap-6 mt-8 text-sm text-slate-500">
          <span>✓ Miễn phí 100%</span>
          <span>✓ 1-2 email/tuần</span>
          <span>✓ Hủy bất cứ lúc nào</span>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
