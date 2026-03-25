import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { postsAPI } from "../services/api";

interface Post {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  content: string;
  image: string;
  author: string;
  views?: number;
  category?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

// Utility: Generate slug from text
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getExcerpt = (content: string, maxLength: number = 120): string => {
  const text = content.replace(/<[^>]*>/g, "");
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const calculateReadingTime = (content: string): number => {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const FeaturedPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postsAPI.getAllPosts() as Post[];
        // Sort by views to get featured posts
        const sortedPosts = data
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-slate-200 rounded" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-slate-200 rounded-2xl" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  const [mainPost, ...sidePosts] = posts;
  const mainPostUrl = `/blog/${mainPost.slug || slugify(mainPost.title)}-${mainPost._id}`;

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-500 uppercase tracking-wide">
                Nổi bật
              </span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Bài viết được xem nhiều nhất
            </h2>
          </div>
          <Link 
            to="/blog"
            className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Featured Post */}
          <Link to={mainPostUrl} className="group">
            <article className="relative h-full min-h-[450px] rounded-3xl overflow-hidden">
              <img
                src={mainPost.image}
                alt={mainPost.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                {mainPost.category && (
                  <span className="inline-block bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                    {mainPost.category.name}
                  </span>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                  {mainPost.title}
                </h3>
                <p className="text-white/80 mb-4 line-clamp-2">
                  {mainPost.description || getExcerpt(mainPost.content)}
                </p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(mainPost.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {calculateReadingTime(mainPost.content)} phút đọc
                  </span>
                </div>
              </div>
            </article>
          </Link>

          {/* Side Posts */}
          <div className="space-y-4">
            {sidePosts.map((post, index) => {
              const postUrl = `/blog/${post.slug || slugify(post.title)}-${post._id}`;
              return (
                <Link key={post._id} to={postUrl} className="group block">
                  <article 
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {post.category && (
                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                          {post.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.createdAt)}
                        </span>
                        {post.views !== undefined && (
                          <span>{post.views.toLocaleString()} views</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 text-center md:hidden">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem tất cả bài viết
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;
