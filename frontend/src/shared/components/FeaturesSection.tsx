import { Link } from "react-router-dom";
import { Bot, Zap, Workflow, ArrowRight } from "lucide-react";
import make from "../../assets/make.png";
import chatgpt from "../../assets/chatgpt.png";
import n8n from "../../assets/n8n-logo.png";

const features = [
  {
    icon: Bot,
    image: chatgpt,
    title: "Làm bạn với AI",
    description: "Học cách sử dụng các công cụ AI phổ biến như ChatGPT, Claude, Gemini và ứng dụng vào công việc thực tiễn: xây dựng nội dung, nghiên cứu, coding...",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    link: "/category/ai",
  },
  {
    icon: Zap,
    image: make,
    title: "Tự động hóa với Make.com",
    description: "Học cách sử dụng Make.com từ cơ bản đến nâng cao. Ứng dụng vào tự động hóa các quy trình giúp tiết kiệm thời gian và tăng hiệu suất.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    link: "/category/make",
  },
  {
    icon: Workflow,
    image: n8n,
    title: "Workflow với N8N",
    description: "N8N - công cụ automation mã nguồn mở mạnh mẽ. Tự host, không giới hạn, tích hợp với hàng trăm ứng dụng và dịch vụ khác nhau.",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    link: "/category/n8n",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Chủ đề chính
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Khám phá nội dung
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Những chủ đề mà chúng tôi tập trung chia sẻ kiến thức và kinh nghiệm
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-full bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-500 overflow-hidden">
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon & Image */}
                <div className="relative mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className={`text-xl font-bold text-slate-900 mb-3 group-hover:bg-gradient-to-r group-hover:${feature.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Link */}
                <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  Khám phá ngay
                  <ArrowRight className={`w-4 h-4 text-current group-hover:translate-x-1 transition-transform`} style={{ color: feature.color.includes('emerald') ? '#10b981' : feature.color.includes('violet') ? '#8b5cf6' : '#f97316' }} />
                </div>

                {/* Decorative corner */}
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
