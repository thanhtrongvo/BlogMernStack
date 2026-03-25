import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import DOMPurify from "dompurify";
import {
  Calendar,
  Clock,
  Eye,
  Facebook,
  Link2,
  MessageCircle,
  Share2,
  Twitter,
} from "lucide-react";

import Header from "../../../shared/components/Header";
import Footer from "../../../shared/components/Footer";
import { Button } from "../../../shared/components/ui/button";
import { useToast } from "../../../shared/components/ui/use-toast";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { commentsAPI, postsAPI } from "../../../shared/services/api";

// ============ INTERFACES ============
interface Author {
  _id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  author: Author;
  createdAt: string;
}

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  image: string;
  author: Author;
  createdAt: string;
  views?: number;
  likes: number;
  comments: Comment[];
  categoryName?: string;
}

interface ApiCommentAuthor {
  _id?: string;
  name?: string;
  avatar?: string;
}

interface ApiComment {
  _id: string;
  content: string;
  authorName?: string;
  author?: string | ApiCommentAuthor;
  createdAt: string;
}

interface ApiPost {
  _id: string;
  title: string;
  content?: string;
  image?: string;
  author?: string | ApiCommentAuthor;
  createdAt: string;
  views?: number;
  likes?: number;
  category?: string | { _id?: string; name?: string };
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface LatestPost {
  _id: string;
  title: string;
  image?: string;
  createdAt: string;
}

// ============ UTILITIES ============
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Decode HTML entities (Vietnamese + common)
 */
function decodeHtmlEntities(html: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

/**
 * Extract TOC from HTML content
 */
const extractTOC = (html: string): TOCItem[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h1, h2, h3");
  const toc: TOCItem[] = [];

  headings.forEach((heading) => {
    const text = heading.textContent || "";
    const id = slugify(text);
    const level = parseInt(heading.tagName[1], 10);
    if (text.trim()) {
      toc.push({ id, text: text.trim(), level });
    }
  });

  return toc;
};

/**
 * Add IDs to headings for anchor navigation
 */
const addIdsToHeadings = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

  headings.forEach((heading) => {
    const text = heading.textContent || "";
    if (!heading.id && text.trim()) {
      heading.id = slugify(text);
    }
  });

  return doc.body.innerHTML;
};

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const calculateReadingTime = (content: string): number => {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// ============ SKELETON COMPONENT ============
function BlogDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="mb-4 h-6 w-24 rounded-full bg-slate-200" />
            <div className="mb-4 h-12 w-3/4 rounded bg-slate-200" />
            <div className="mb-6 flex gap-4">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
            </div>
            <div className="aspect-video w-full rounded-2xl bg-slate-200" />
          </div>

          {/* Content skeleton */}
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 rounded bg-slate-200" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
            </div>
            <div className="hidden lg:block">
              <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ============ 404 COMPONENT ============
function NotFoundState() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="flex flex-1 items-center justify-center py-20">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">404</h1>
          <h2 className="mb-2 text-xl font-semibold text-slate-700">Không tìm thấy bài viết</h2>
          <p className="mb-6 text-slate-500">Bài viết có thể đã bị xoá hoặc đường dẫn không chính xác.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            ← Quay lại Blog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ============ TABLE OF CONTENTS ============
function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Mục lục
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level > 1 ? `${(item.level - 1) * 0.75}rem` : 0 }}>
            <a
              href={`#${item.id}`}
              className={`block text-sm transition-colors ${
                activeId === item.id
                  ? "font-medium text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ============ RECENT POSTS SIDEBAR ============
function RecentPostsSidebar({ posts, currentPostId }: { posts: LatestPost[]; currentPostId: string }) {
  const filteredPosts = posts.filter((p) => p._id !== currentPostId).slice(0, 3);

  if (filteredPosts.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Bài viết mới
      </h3>
      <ul className="space-y-4">
        {filteredPosts.map((post) => {
          const postSlug = slugify(post.title);
          const postUrl = `/blog/${postSlug}-${post._id}`;
          return (
            <li key={post._id}>
              <Link to={postUrl} className="group flex gap-3">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover transition group-hover:opacity-80"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-slate-800 transition group-hover:text-blue-600">
                    {post.title}
                  </p>
                  <span className="mt-1 text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ============ SHARE BUTTONS ============
function ShareButtons({ onShare }: { onShare: (type: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-500">Chia sẻ:</span>
      <Button variant="outline" size="icon" onClick={() => onShare("copy")} title="Copy link">
        <Link2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => onShare("facebook")} title="Facebook">
        <Facebook className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => onShare("twitter")} title="Twitter">
        <Twitter className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => onShare("native")} title="Share">
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ============ COMMENT SECTION ============
function CommentSection({
  comments,
  postId,
  onCommentAdded,
}: {
  comments: Comment[];
  postId: string;
  onCommentAdded: (comment: Comment) => void;
}) {
  const { toast } = useToast();
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || !content.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên và nội dung bình luận.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = (await commentsAPI.createComment({
        postId,
        content,
        authorName,
      })) as ApiComment;

      const newComment: Comment = {
        _id: response._id,
        content: response.content,
        author: {
          _id: response._id,
          name: response.authorName || authorName,
          avatar: "https://github.com/shadcn.png",
        },
        createdAt: response.createdAt || new Date().toISOString(),
      };

      onCommentAdded(newComment);
      setContent("");
      toast({ title: "Đã gửi bình luận!" });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi bình luận. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 border-t border-slate-200 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bình luận</h2>
          <p className="text-slate-500">Chia sẻ suy nghĩ của bạn về bài viết này</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {comments.length} phản hồi
        </span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div className="mb-4">
          <label htmlFor="authorName" className="mb-2 block text-sm font-medium text-slate-700">
            Tên của bạn
          </label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Nhập tên..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="mb-2 block text-sm font-medium text-slate-700">
            Nội dung
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <Button type="submit" disabled={isSubmitting || !content.trim() || !authorName.trim()}>
          {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-slate-400">Hãy là người đầu tiên bình luận!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <img
                src={comment.author.avatar || "https://github.com/shadcn.png"}
                alt={comment.author.name}
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-semibold text-slate-900">{comment.author.name}</span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
                <div
                  className="prose prose-sm prose-slate max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ============ MAIN COMPONENT ============
export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);

  // Extract post ID from slug (format: post-title-slug-{id})
  const extractPostId = (slugParam: string): string => {
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

  const id = slug ? extractPostId(slug) : undefined;

  // Process content: decode entities, add heading IDs, sanitize
  const { sanitizedHtml, tocItems, readingTime } = useMemo(() => {
    if (!post?.content) {
      return { sanitizedHtml: "", tocItems: [], readingTime: 1 };
    }

    // Decode HTML entities first
    let html = decodeHtmlEntities(post.content);

    // Add IDs to headings for TOC navigation
    html = addIdsToHeadings(html);

    // Sanitize HTML while preserving styles
    const sanitized = DOMPurify.sanitize(html, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "style", "data-path-to-node"],
    });

    return {
      sanitizedHtml: sanitized,
      tocItems: extractTOC(sanitized),
      readingTime: calculateReadingTime(html),
    };
  }, [post?.content]);

  // Fetch post data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch post
        const postData = (await postsAPI.getPostById(id)) as ApiPost;

        // Track view
        await postsAPI.trackPostView(id);

        // Parse author
        const authorObj =
          typeof postData.author === "object" && postData.author !== null
            ? postData.author
            : null;

        setPost({
          _id: postData._id,
          title: postData.title,
          content: postData.content || "", // Keep original HTML!
          image: postData.image || "",
          author: {
            _id: authorObj?._id || "unknown",
            name: authorObj?.name || (typeof postData.author === "string" ? postData.author : "Admin"),
            avatar: authorObj?.avatar || "https://github.com/shadcn.png",
          },
          createdAt: postData.createdAt,
          views: postData.views || 0,
          likes: postData.likes || 0,
          comments: [],
          categoryName:
            typeof postData.category === "object" && postData.category !== null
              ? postData.category.name
              : typeof postData.category === "string"
                ? postData.category
                : undefined,
        });

        // Fetch comments
        try {
          const commentsData = (await commentsAPI.getCommentsByPostId(id)) as ApiComment[];
          if (commentsData?.length > 0) {
            setPost((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                comments: commentsData.map((item) => {
                  const commentAuthor =
                    typeof item.author === "object" && item.author !== null
                      ? (item.author as ApiCommentAuthor)
                      : null;
                  return {
                    _id: item._id,
                    content: item.content,
                    author: {
                      _id: commentAuthor?._id || item._id,
                      name: item.authorName || commentAuthor?.name || "Khách",
                      avatar: commentAuthor?.avatar || "https://github.com/shadcn.png",
                    },
                    createdAt: item.createdAt,
                  };
                }),
              };
            });
          }
        } catch (err) {
          console.error("Error fetching comments:", err);
        }

        // Fetch latest posts
        try {
          const postsData = (await postsAPI.getAllPosts()) as ApiPost[];
          setLatestPosts(
            postsData.slice(0, 5).map((p) => ({
              _id: p._id,
              title: p.title,
              image: p.image,
              createdAt: p.createdAt,
            }))
          );
        } catch (err) {
          console.error("Error fetching latest posts:", err);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Update document title
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Blog`;
    }
    return () => {
      document.title = "Blog";
    };
  }, [post]);

  // Handlers
  const handleShare = async (type: string) => {
    if (!post) return;
    const url = window.location.href;

    switch (type) {
      case "copy":
        await navigator.clipboard.writeText(url);
        toast({ title: "Đã sao chép liên kết!" });
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`,
          "_blank"
        );
        break;
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({ title: post.title, url });
          } catch {
            await navigator.clipboard.writeText(url);
            toast({ title: "Đã sao chép liên kết!" });
          }
        } else {
          await navigator.clipboard.writeText(url);
          toast({ title: "Đã sao chép liên kết!" });
        }
        break;
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Đăng nhập để thích bài viết này.",
      });
      return;
    }

    setPost((prev) =>
      prev
        ? { ...prev, likes: hasLiked ? prev.likes - 1 : prev.likes + 1 }
        : null
    );
    setHasLiked(!hasLiked);
  };

  const handleCommentAdded = (comment: Comment) => {
    setPost((prev) =>
      prev ? { ...prev, comments: [comment, ...prev.comments] } : null
    );
  };

  // Render states
  if (isLoading) return <BlogDetailSkeleton />;
  if (!post) return <NotFoundState />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ===== HEADER SECTION ===== */}
          <header className="mb-8 lg:mb-12">
            {/* Category Badge */}
            {post.categoryName && (
              <span className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
                {post.categoryName}
              </span>
            )}

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="font-medium text-slate-700">{post.author.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{readingTime} phút đọc</span>
              </div>
              {post.views !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} lượt xem</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments.length} bình luận</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.image && (
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={post.image}
                  alt={post.title}
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}
          </header>

          {/* ===== MAIN CONTENT GRID ===== */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Content Column */}
            <div className="flex-1 min-w-0">
              {/* Share Bar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <ShareButtons onShare={handleShare} />
                <Button
                  variant={hasLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className="gap-2"
                >
                  👍 {hasLiked ? "Đã thích" : "Thích"} · {post.likes}
                </Button>
              </div>

              {/* Article Content */}
              <article
                className="blog-content rounded-xl border border-slate-200 bg-white p-6 lg:p-8"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />

              {/* Comment Section */}
              <CommentSection
                comments={post.comments}
                postId={post._id}
                onCommentAdded={handleCommentAdded}
              />
            </div>

            {/* Sidebar Column */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <TableOfContents items={tocItems} />
                <RecentPostsSidebar posts={latestPosts} currentPostId={post._id} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
