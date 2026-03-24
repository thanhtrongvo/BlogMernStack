import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../../shared/components/ui/use-toast";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { Avatar } from "../../../shared/components/ui/avatar";
import { Button } from "../../../shared/components/ui/button";
import { Editor } from "@tinymce/tinymce-react";
import { formatDistanceToNow } from "date-fns";
import { postsAPI, commentsAPI } from "../../../shared/services/api";
import Header from "../../../shared/components/Header";
import Footer from "../../../shared/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { convertHtmlToMarkdown } from "../../../shared/services/markdownUtils";
import "./BlogDetail.css";

// Temporary types (replace with your actual types)
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
}

// Interface for heading structure used in table of contents
interface Heading {
  id: string;
  text: string;
  level: number;
}

// Interface for latest posts
interface LatestPost {
  _id: string;
  title: string;
  image?: string;
  createdAt: string;
}

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

  // Extract headings from markdown content
  const extractHeadings = (markdown: string): Heading[] => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const extracted: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      extracted.push({ level, text, id });
    }

    return extracted;
  };

  // Fetch blog post
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        if (!id) return;

        // Get post details from API
        const postData = (await postsAPI.getPostById(id)) as ApiPost;
        const normalizedContent = convertHtmlToMarkdown(postData.content || "");

        // Track post view
        await postsAPI.trackPostView(id);

        // Transform API response to match BlogPost structure
        setPost({
          _id: postData._id,
          title: postData.title,
          content: normalizedContent,
          image: postData.image || "",
          author: {
            _id: typeof postData.author === "object" && postData.author !== null ? postData.author._id || "unknown" : "unknown",
            name:
              typeof postData.author === "object" && postData.author !== null
                ? postData.author.name || "unknown"
                : postData.author || "unknown",
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
        });

        // Extract headings from content for table of contents
        setHeadings(extractHeadings(normalizedContent));

        // Get comments for this post
        try {
          const commentsData = (await commentsAPI.getCommentsByPostId(
            id,
          )) as ApiComment[];
          if (commentsData && commentsData.length > 0) {
            setPost((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                comments: commentsData.map((comment: ApiComment) => {
                  const isObj =
                    typeof comment.author === "object" &&
                    comment.author !== null;
                  const authorObj = isObj
                    ? (comment.author as ApiCommentAuthor)
                    : null;
                  return {
                    _id: comment._id,
                    content: comment.content,
                    author: {
                      _id:
                        authorObj && authorObj._id
                          ? authorObj._id
                          : comment._id,
                      name:
                        comment.authorName ||
                        authorObj?.name ||
                        (typeof comment.author === "string"
                          ? comment.author
                          : "") ||
                        "Khách",
                      avatar:
                        authorObj?.avatar || "https://github.com/shadcn.png",
                    },
                    createdAt: comment.createdAt,
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
          title: "Error",
          description: "Failed to load blog post. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch latest posts
    const fetchLatestPosts = async () => {
      try {
        const postsData = (await postsAPI.getAllPosts()) as ApiPost[];
        // Get latest 5 posts
        const latest = postsData.slice(0, 5).map((post: ApiPost) => ({
          _id: post._id,
          title: post.title,
          image: post.image,
          createdAt: post.createdAt,
        }));
        setLatestPosts(latest);
      } catch (error) {
        console.error("Error fetching latest posts:", error);
      }
    };

    if (id) {
      fetchPost();
      fetchLatestPosts();
    }
  }, [id, toast]);

  // Handle like button click
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to like this post.",
        variant: "default",
      });
      return;
    }

    try {
      // Replace with your actual API call when like endpoint is available
      // await fetch(`/api/posts/${id}/like`, { method: 'POST' });

      // Optimistic update
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: hasLiked ? prev.likes - 1 : prev.likes + 1,
            }
          : null,
      );

      setHasLiked(!hasLiked);

      toast({
        title: hasLiked ? "Like removed" : "Post liked",
        variant: "default",
      });
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle comment submission
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
      // Create new comment via API
      const commentData = {
        postId: id,
        content: comment,
        authorName: authorName,
      };

      const newCommentData = (await commentsAPI.createComment(
        commentData,
      )) as ApiComment;

      // Add the new comment to the post's comments
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

      // Update post with new comment
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [newComment, ...prev.comments],
            }
          : null,
      );

      setComment("");
      toast({
        title: "Comment added",
        variant: "default",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract headings for table of contents
  useEffect(() => {
    if (post) {
      const extractedHeadings = extractHeadings(post.content);
      setHeadings(extractedHeadings);
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-96 bg-gray-200 rounded mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-32 bg-gray-200 rounded mb-6"></div>
            </div>
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
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800">
                Post not found
              </h2>
              <p className="text-gray-600 mt-2">
                The blog post you're looking for doesn't exist or has been
                removed.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Component for table of contents
  const TableOfContents = () => {
    if (headings.length === 0) return null;

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 table-of-contents">
        <h4 className="text-lg font-semibold mb-3 text-gray-900">Mục lục</h4>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ marginLeft: `${(heading.level - 1) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Component for latest posts sidebar
  const LatestPostsSidebar = () => {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold mb-3 text-gray-900">
          Bài viết mới nhất
        </h4>
        <ul className="space-y-4">
          {latestPosts.map((post) => (
            <li
              key={post._id}
              className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              <a href={`/blog/${post._id}`} className="group">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}
                <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h5>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container-fixed py-8">
          <div className="blog-detail-layout">
            {/* Main Content Area */}
            <div className="blog-main-content">
              {/* Blog Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>

                {/* Author and Date */}
                <div className="flex items-center mb-6">
                  <Avatar className="h-10 w-10 mr-3">
                    <img
                      src={
                        post.author.avatar || "https://github.com/shadcn.png"
                      }
                      alt={post.author.name}
                    />
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {post.author.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Blog Content */}
              <div
                className="prose prose-lg blog-content mb-8"
                ref={contentRef}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children, ...props }) => (
                      <h1
                        id={children
                          ?.toString()
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/\s+/g, "-")}
                        {...props}
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children, ...props }) => (
                      <h2
                        id={children
                          ?.toString()
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/\s+/g, "-")}
                        {...props}
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }) => (
                      <h3
                        id={children
                          ?.toString()
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/\s+/g, "-")}
                        {...props}
                      >
                        {children}
                      </h3>
                    ),
                    h4: ({ children, ...props }) => (
                      <h4
                        id={children
                          ?.toString()
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/\s+/g, "-")}
                        {...props}
                      >
                        {children}
                      </h4>
                    ),
                    h5: ({ children, ...props }) => (
                      <h5
                        id={children
                          ?.toString()
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/\s+/g, "-")}
                        {...props}
                      >
                        {children}
                      </h5>
                    ),
                    h6: ({ children, ...props }) => (
                      <h6
                        id={children
                          ?.toString()
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/\s+/g, "-")}
                        {...props}
                      >
                        {children}
                      </h6>
                    ),
                    code: ({
                      className,
                      children,
                      ...props
                    }: React.ComponentPropsWithoutRef<"code"> & {
                      inline?: boolean;
                    }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const inline = !match;
                      return !inline && match ? (
                        <SyntaxHighlighter
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          style={vs as any}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Like Button */}
              <div className="border-t border-b py-4 my-8">
                <Button
                  onClick={handleLike}
                  variant={hasLiked ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <span className="text-xl">👍</span>
                  <span>Like</span>
                  <span className="ml-1 bg-gray-100 px-2 py-1 rounded-full text-sm">
                    {post.likes}
                  </span>
                </Button>
              </div>

              {/* Comments Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6">
                  Comments ({post.comments.length})
                </h3>

                {/* Comment Form */}
                <form
                  onSubmit={handleCommentSubmit}
                  className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
                >
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">
                    Để lại bình luận
                  </h4>
                  <div className="mb-4">
                    <label
                      htmlFor="authorName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tên của bạn *
                    </label>
                    <input
                      type="text"
                      id="authorName"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Nhập tên của bạn"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung bình luận *
                    </label>
                    <div className="bg-white rounded-md overflow-hidden border border-gray-300">
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
                            "image",
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
                            "code",
                            "help",
                            "wordcount",
                          ],
                          toolbar:
                            "bold italic underline | bullist numlist | link",
                          content_style:
                            'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px }',
                          branding: false,
                        }}
                        value={comment}
                        onEditorChange={(content) => setComment(content)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || !comment.trim() || !authorName.trim()
                    }
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                  </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-6">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="border-b pb-6">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <img
                            src={
                              comment.author.avatar ||
                              "https://github.com/shadcn.png"
                            }
                            alt={comment.author.name}
                          />
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-medium text-gray-900">
                              {comment.author.name}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(
                                new Date(comment.createdAt),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>
                          <div
                            className="text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: comment.content,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {post.comments.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="blog-sidebar">
              <div className="blog-sidebar-sticky space-y-6">
                {/* Table of Contents */}
                <TableOfContents />

                {/* Latest Posts */}
                <LatestPostsSidebar />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
