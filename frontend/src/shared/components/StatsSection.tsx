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
  }, []);

  const statsItems = [
    {
      icon: FileText,
      value: stats.totalPosts,
      label: "Bài viết",
    },
    {
      icon: Eye,
      value: stats.totalViews,
      label: "Lượt xem",
    },
    {
      icon: FolderOpen,
      value: stats.totalCategories,
      label: "Danh mục",
    },
    {
      icon: Users,
      value: "1K+",
      label: "Độc giả",
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl mb-3">
                <item.icon className="w-6 h-6 text-slate-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </div>
              <div className="text-sm text-slate-500">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
