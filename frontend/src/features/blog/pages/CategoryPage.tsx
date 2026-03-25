import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Eye, ChevronRight } from "lucide-react";

import Header from "../../../shared/components/Header";
import Footer from "../../../shared/components/Footer";
import { categoriesAPI, postsAPI } from "../../../shared/services/api";

// Interfaces
interface Category {
  _id: string;
  name: string;
  description: string;
  status: string;
}

interface Post {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  content: string;
  image: string;
  author: string;
  createdAt: string;
  views?: number;
  category?: {
    _id: string;
    name: string;
  };
}

// Utility: Generate slug from title
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

// Utility: Format date
const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Utility: Strip HTML and truncate
const getExcerpt = (content: string, maxLength: number = 150): string => {
  const text = content.replace(/<[^>]*>/g, "");
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Skeleton Loading
function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 w-48 rounded bg-slate-200 mb-4" />
            <div className="h-6 w-96 rounded bg-slate-200" />
          </div>

          {/* Posts grid skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse">
                <div className="aspect-video bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Empty State
function EmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="flex flex-1 items-center justify-center py-20">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-slate-900">Chưa có bài viết</h1>
          <p className="mb-6 text-slate-500">
            Danh mục "{categoryName}" chưa có bài viết nào.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            ← Về trang chủ
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Post Card Component
function PostCard({ post }: { post: Post }) {
  // Generate URL slug from post slug or title
  const postSlug = post.slug || slugify(post.title);
  const postUrl = `/blog/${postSlug}-${post._id}`;

  return (
    <article className="group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={postUrl} className="block">
        {/* Image */}
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category badge */}
          {post.category && (
            <span className="inline-block mb-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {post.category.name}
            </span>
          )}

          {/* Title */}
          <h2 className="mb-2 text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="mb-4 text-sm text-slate-600 line-clamp-2">
            {post.description || getExcerpt(post.content)}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.createdAt)}
              </span>
              {post.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {post.views}
                </span>
              )}
            </div>
            <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Đọc thêm <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

// Main Component
export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract category ID from slug (format: category-name-{id})
  const extractCategoryId = (slugParam: string): string => {
    // Try to extract MongoDB ObjectId from the end
    const parts = slugParam.split("-");
    const lastPart = parts[parts.length - 1];
    
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    if (/^[a-f0-9]{24}$/i.test(lastPart)) {
      return lastPart;
    }
    
    // Otherwise return the whole slug as ID (fallback for old URLs)
    return slugParam;
  };

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const categoryId = extractCategoryId(slug);

        // Fetch all categories to find the current one
        const categoriesData = await categoriesAPI.getPublicCategories() as Category[];
        setAllCategories(categoriesData);

        // Find current category
        const currentCategory = categoriesData.find((c) => c._id === categoryId);
        if (currentCategory) {
          setCategory(currentCategory);
        }

        // Fetch posts for this category
        const postsData = await postsAPI.getPostsByCategory(categoryId) as Post[];
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching category data:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (isLoading) return <CategorySkeleton />;
  if (!category) return <EmptyState categoryName={slug || "Unknown"} />;
  if (posts.length === 0) return <EmptyState categoryName={category.name} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 font-medium">{category.name}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-slate-600">{category.description}</p>
            )}
            <p className="mt-2 text-sm text-slate-500">
              {posts.length} bài viết
            </p>
          </header>

          {/* Posts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Other Categories */}
          {allCategories.length > 1 && (
            <section className="mt-12 pt-8 border-t border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Danh mục khác
              </h2>
              <div className="flex flex-wrap gap-3">
                {allCategories
                  .filter((c) => c._id !== category._id)
                  .map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/category/${slugify(cat.name)}-${cat._id}`}
                      className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
