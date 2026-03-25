import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, TrendingUp, ArrowRight } from "lucide-react";
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
    day: "numeric",
    month: "short",
  });

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
        const sortedPosts = data
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 4);
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
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-200 rounded" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-80 bg-slate-200 rounded-2xl" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-slate-200 rounded-xl" />
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
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Bài viết nổi bật</h2>
          </div>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Main Post */}
          <Link to={mainPostUrl} className="group">
            <article className="relative h-full min-h-[380px] rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={mainPost.image}
                alt={mainPost.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {mainPost.category && (
                  <span className="inline-block bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                    {mainPost.category.name}
                  </span>
                )}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors line-clamp-2">
                  {mainPost.title}
                </h3>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(mainPost.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {calculateReadingTime(mainPost.content)} phút
                  </span>
                </div>
              </div>
            </article>
          </Link>

          {/* Side Posts */}
          <div className="space-y-4">
            {sidePosts.map((post) => {
              const postUrl = `/blog/${post.slug || slugify(post.title)}-${post._id}`;
              return (
                <Link key={post._id} to={postUrl} className="group flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    {post.category && (
                      <span className="text-xs font-medium text-blue-600 mb-1 block">
                        {post.category.name}
                      </span>
                    )}
                    <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>•</span>
                      <span>{post.views?.toLocaleString() || 0} views</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;
