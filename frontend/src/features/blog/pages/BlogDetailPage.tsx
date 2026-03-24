import { useEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Editor } from "@tinymce/tinymce-react";
import { Share2, Copy, Facebook, Twitter, MessageCircle, Clock, Eye } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";

import Header from "../../../shared/components/Header";
import Footer from "../../../shared/components/Footer";
import { Avatar } from "../../../shared/components/ui/avatar";
import { Button } from "../../../shared/components/ui/button";
import { useToast } from "../../../shared/components/ui/use-toast";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { commentsAPI, postsAPI } from "../../../shared/services/api";
import { convertHtmlToMarkdown } from "../../../shared/services/markdownUtils";
import "./BlogDetail.css";

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
  likes?: number;
  category?: string | { _id?: string; name?: string };
}

interface Heading {
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

type MarkdownCodeProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>;

type ShareChannel = "copy" | "facebook" | "twitter";

const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const extractHeadingsFromMarkdown = (markdown: string): Heading[] => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const extracted: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    extracted.push({ level, text, id: slugifyHeading(text) });
  }

  return extracted;
};

const collectText = (node?: ReactNode): string => {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((child) => collectText(child)).join('');
  return '';
};

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const markdownBody = useMemo(() => post?.content ?? "", [post?.content]);
  const readingTime = useMemo(() => {
    if (!markdownBody) return "1 phút đọc";
    const words = markdownBody.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return `${minutes} phút đọc`;
  }, [markdownBody]);

  const markdownComponents = useMemo<Components>(() => ({
    code({ inline, className, children, ...props }: MarkdownCodeProps) {
      const match = /language-(\w+)/.exec(className || '');
      const childContent = Array.isArray(children)
        ? children.map((child) => String(child)).join('')
        : String(children ?? '');

      if (!inline && match) {
        return (
          <SyntaxHighlighter
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={vs as any}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {childContent.replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => {
      const value = collectText(children);
      return <h1 id={slugifyHeading(value)}>{children}</h1>;
    },
    h2: ({ children }) => {
      const value = collectText(children);
      return <h2 id={slugifyHeading(value)}>{children}</h2>;
    },
    h3: ({ children }) => {
      const value = collectText(children);
      return <h3 id={slugifyHeading(value)}>{children}</h3>;
    },
  }), []);



  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const postData = (await postsAPI.getPostById(id)) as ApiPost;
        const normalizedContent = convertHtmlToMarkdown(postData.content || "");

        await postsAPI.trackPostView(id);

        setPost({
          _id: postData._id,
          title: postData.title,
          content: normalizedContent,
          image: postData.image || "",
          author: {
            _id:
              typeof postData.author === "object" && postData.author !== null
                ? postData.author._id || "unknown"
                : "unknown",
            name:
              typeof postData.author === "object" && postData.author !== null
                ? postData.author.name || "unknown"
                : typeof postData.author === "string"
                  ? postData.author
                  : "unknown",
            avatar:
              typeof postData.author === "object" &&
              postData.author !== null &&
              postData.author.avatar
                ? postData.author.avatar
                : "https://github.com/shadcn.png",
          },
          createdAt: postData.createdAt,
          likes: postData.likes || 0,
          comments: [],
          categoryName:
            typeof postData.category === "object" && postData.category !== null
              ? postData.category.name
              : typeof postData.category === "string"
                ? postData.category
                : undefined,
        });

        setHeadings(extractHeadingsFromMarkdown(normalizedContent));

        try {
          const commentsData = (await commentsAPI.getCommentsByPostId(id)) as ApiComment[];
          if (commentsData && commentsData.length > 0) {
            setPost((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                comments: commentsData.map((item) => {
                  const authorObj =
                    typeof item.author === "object" && item.author !== null
                      ? (item.author as ApiCommentAuthor)
                      : null;
                  return {
                    _id: item._id,
                    content: item.content,
                    author: {
                      _id: authorObj?._id || item._id,
                      name: item.authorName || authorObj?.name || "Khách",
                      avatar: authorObj?.avatar || "https://github.com/shadcn.png",
                    },
                    createdAt: item.createdAt,
                  };
                }),
              };
            });
          }
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải bài viết. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLatestPosts = async () => {
      try {
        const postsData = (await postsAPI.getAllPosts()) as ApiPost[];
        const latest = postsData.slice(0, 5).map((item) => ({
          _id: item._id,
          title: item.title,
          image: item.image,
          createdAt: item.createdAt,
        }));
        setLatestPosts(latest);
      } catch (error) {
        console.error("Error fetching latest posts:", error);
      }
    };

    fetchPost();
    fetchLatestPosts();
  }, [id, toast]);

  useEffect(() => {
    if (!post) return;
    setHeadings(extractHeadingsFromMarkdown(post.content));
  }, [post]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Bạn cần đăng nhập",
        description: "Đăng nhập để bày tỏ cảm xúc với bài viết.",
      });
      return;
    }

    setPost((prev) =>
      prev
        ? {
            ...prev,
            likes: hasLiked ? prev.likes - 1 : prev.likes + 1,
          }
        : null,
    );

    setHasLiked(!hasLiked);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !authorName.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên và nội dung bình luận.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        postId: id,
        content: comment,
        authorName,
      };
      const newCommentData = (await commentsAPI.createComment(payload)) as ApiComment;
      const newComment = {
        _id: newCommentData._id,
        content: newCommentData.content,
        author: {
          _id: newCommentData._id,
          name: newCommentData.authorName || authorName,
          avatar: "https://github.com/shadcn.png",
        },
        createdAt: newCommentData.createdAt || new Date().toISOString(),
      };

      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [newComment, ...prev.comments],
            }
          : null,
      );

      setComment("");
      toast({ title: "Đã gửi bình luận" });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi bình luận. Thử lại sau nhé.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async (channel: ShareChannel) => {
    if (typeof window === "undefined" || !post) return;
    const url = window.location.href;

    switch (channel) {
      case "copy":
        await navigator.clipboard.writeText(url);
        toast({ title: "Đã sao chép liên kết" });
        return;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        return;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`,
          "_blank",
        );
        return;
      default:
        return;
    }
  };

  const handleNativeShare = async () => {
    if (typeof window === 'undefined' || !post) {
      await handleShare('copy');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: window.location.href });
        return;
      } catch {
        /* fall back to copy */
      }
    }
    await handleShare('copy');
  };

  const formattedDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const TableOfContents = () => {
    if (!headings.length) return null;
    return (
      <div className="toc-card">
        <h4>Mục lục</h4>
        <ul>
          {headings.map((heading) => (
            <li key={heading.id} style={{ marginLeft: `${(heading.level - 1) * 12}px` }}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const LatestPostsSidebar = () => (
    <div className="latest-card">
      <h4>Bài viết mới</h4>
      <ul>
        {latestPosts.map((item) => (
          <li key={item._id}>
            <Link to={`/blog/${item._id}`} className="latest-link">
              {item.image && <img src={item.image} alt={item.title} />}
              <div>
                <p>{item.title}</p>
                <span>{formattedDate(item.createdAt)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container-fixed py-10">
            <div className="skeleton" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-bold mb-3">Không tìm thấy bài viết</h2>
            <p>Liên kết có thể đã bị xoá hoặc sai đường dẫn.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen blog-detail-page">
      <Header />
      <main className="flex-grow bg-slate-50">
        <div className="container-fixed py-10">
          <section className="blog-hero">
            <div className="hero-meta">
              <div className="hero-badges">
                {post.categoryName && <span className="badge">{post.categoryName}</span>}
                <span className="badge badge-muted">{readingTime}</span>
              </div>
              <h1>{post.title}</h1>
              <p className="hero-subtext">
                Tổng hợp chuyên sâu bằng tiếng Việt với giọng văn tự nhiên, tối ưu SEO và dễ đọc.
              </p>
              <div className="hero-author">
                <div className="author-info">
                  <Avatar className="h-12 w-12">
                    <img src={post.author.avatar} alt={post.author.name} />
                  </Avatar>
                  <div>
                    <p className="author-name">{post.author.name}</p>
                    <p className="author-date">{formattedDate(post.createdAt)}</p>
                  </div>
                </div>
                <div className="hero-stats">
                  <span><Eye size={16} /> {readingTime}</span>
                  <span><Clock size={16} /> {post.likes} lượt thích</span>
                  <span><MessageCircle size={16} /> {post.comments.length} bình luận</span>
                </div>
              </div>
            </div>
            {post.image && (
              <div className="hero-cover">
                <img src={post.image} alt={post.title} />
              </div>
            )}
          </section>

          <div className="blog-layout">
            <article className="blog-article" ref={contentRef}>
              <div className="share-panel">
                <p>Chia sẻ bài viết</p>
                <div className="share-buttons">
                  <Button variant="outline" size="icon" onClick={() => handleShare('copy')}>
                    <Copy size={16} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
                    <Facebook size={16} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}>
                    <Twitter size={16} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNativeShare}>
                    <Share2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="blog-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {markdownBody}
                </ReactMarkdown>
              </div>

              <div className="like-panel">
                <Button onClick={handleLike} variant={hasLiked ? "default" : "outline"} className="like-button">
                  👍 {hasLiked ? "Đã thích" : "Thích bài viết"} · {post.likes}
                </Button>
              </div>

              <section className="comment-section">
                <div className="comment-header">
                  <div>
                    <h3>Bình luận</h3>
                    <p>Hãy chia sẻ suy nghĩ của bạn về bài viết này.</p>
                  </div>
                  <span className="comment-count">{post.comments.length} phản hồi</span>
                </div>

                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <div className="comment-inputs">
                    <input
                      type="text"
                      placeholder="Tên của bạn"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                    <div className="comment-editor">
                      <Editor
                        apiKey={import.meta.env.VITE_TINY_API_KEY}
                        init={{
                          height: 200,
                          menubar: false,
                          plugins: [
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "help",
                            "wordcount",
                          ],
                          toolbar: "bold italic underline | bullist numlist | link",
                          branding: false,
                        }}
                        value={comment}
                        onEditorChange={(value) => setComment(value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting || !comment.trim() || !authorName.trim()}>
                    {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                  </Button>
                </form>

                <div className="comment-list">
                  {post.comments.length === 0 && <p className="no-comment">Hãy là người đầu tiên bình luận!</p>}
                  {post.comments.map((item) => (
                    <div key={item._id} className="comment-card">
                      <Avatar className="h-10 w-10">
                        <img src={item.author.avatar} alt={item.author.name} />
                      </Avatar>
                      <div>
                        <div className="comment-meta">
                          <p className="comment-author">{item.author.name}</p>
                          <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div
                          className="comment-content"
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </article>

            <aside className="blog-sidebar">
              <TableOfContents />
              <LatestPostsSidebar />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
