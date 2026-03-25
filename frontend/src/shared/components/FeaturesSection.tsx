import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import make from "../../assets/make.png";
import chatgpt from "../../assets/chatgpt.png";
import n8n from "../../assets/n8n-logo.png";

const features = [
  {
    image: chatgpt,
    title: "Làm bạn với AI",
    description: "Học cách sử dụng các công cụ AI phổ biến như ChatGPT, Claude, Gemini và ứng dụng vào công việc thực tiễn.",
    link: "/category/ai",
  },
  {
    image: make,
    title: "Tự động hóa với Make.com",
    description: "Học cách sử dụng Make.com từ cơ bản đến nâng cao. Tự động hóa quy trình giúp tiết kiệm thời gian.",
    link: "/category/make",
  },
  {
    image: n8n,
    title: "Workflow với N8N",
    description: "N8N - công cụ automation mã nguồn mở. Tự host, không giới hạn, tích hợp với hàng trăm ứng dụng.",
    link: "/category/n8n",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Chủ đề chính
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Những chủ đề mà chúng tôi tập trung chia sẻ kiến thức và kinh nghiệm
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group block p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-8 h-8 object-contain"
                />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Link */}
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
                Khám phá
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
