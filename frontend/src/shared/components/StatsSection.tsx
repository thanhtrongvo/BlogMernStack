import { useEffect, useState } from "react";
import { FileText, Eye, FolderOpen, Users } from "lucide-react";
import { postsAPI, categoriesAPI } from "../services/api";

interface StatsData {
  totalPosts: number;
  totalViews: number;
  totalCategories: number;
}

const StatsSection = () => {
  const [stats, setStats] = useState<StatsData>({
    totalPosts: 0,
    totalViews: 0,
    totalCategories: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [posts, categories] = await Promise.all([
          postsAPI.getAllPosts() as Promise<any[]>,
          categoriesAPI.getPublicCategories() as Promise<any[]>,
        ]);

        const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

        setStats({
          totalPosts: posts.length,
          totalViews,
          totalCategories: categories.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();

    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const statsItems = [
    {
      icon: FileText,
      value: stats.totalPosts,
      label: "Bài viết",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Eye,
      value: stats.totalViews,
      label: "Lượt xem",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: FolderOpen,
      value: stats.totalCategories,
      label: "Danh mục",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Users,
      value: "1K+",
      label: "Độc giả",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statsItems.map((item, index) => (
            <div
              key={item.label}
              className={`relative group transform transition-all duration-700 ${
                isVisible 
                  ? "translate-y-0 opacity-100" 
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${item.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-7 h-7 bg-gradient-to-r ${item.color} bg-clip-text`} style={{ color: 'transparent', backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                  <item.icon className={`w-7 h-7 text-transparent bg-gradient-to-r ${item.color}`} style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                </div>

                {/* Counter */}
                <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </div>

                {/* Label */}
                <div className="text-sm text-slate-500 font-medium">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
