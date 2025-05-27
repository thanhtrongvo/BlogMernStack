import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../../shared/components/ui/use-toast";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { Avatar } from "../../../shared/components/ui/avatar";
import { Button } from "../../../shared/components/ui/button";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Card } from "../../../shared/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { postsAPI, commentsAPI } from "../../../shared/services/api";
import Header from "../../../shared/components/Header";
import Footer from "../../../shared/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
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

// Interface for heading structure used in table of contents (removed)
// interface Heading {
//   id: string;
//   text: string;
//   level: number;
// }

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
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [headings, setHeadings] = useState<Heading[]>([]); // Removed table of contents
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Extract headings from markdown or HTML content (removed for table of contents)
  // const extractHeadings = (content: string): Heading[] => {
  //   const extracted: Heading[] = [];
  //
  //   // Check if content is HTML or Markdown
  //   const isHtml = /<[^>]*>/g.test(content);
  //
  //   if (isHtml) {
  //     // Extract headings from HTML
  //     const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  //     let match;
  //
  //     while ((match = headingRegex.exec(content)) !== null) {
  //       const level = parseInt(match[1]);
  //       const text = match[2].replace(/<[^>]*>/g, '').trim(); // Remove any nested HTML tags
  //       const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  //       extracted.push({ level, text, id });
  //     }
  //   } else {
  //     // Extract headings from Markdown
  //     const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  //     let match;

  //     while ((match = headingRegex.exec(content)) !== null) {
  //       const level = match[1].length;
  //       const text = match[2].trim();
  //       const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  //       extracted.push({ level, text, id });
  //     }
  //   }

  //   return extracted;
  // };

  // Fetch blog post
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        if (!id) return;

        // Get post details from API
        const postData: any = await postsAPI.getPostById(id);
        console.log("Fetched post data:", postData); // Debug log

        // Track post view
        await postsAPI.trackPostView(id);

        // Transform API response to match BlogPost structure
        const processedContent = postData.content || "";
        console.log("Processed content:", processedContent); // Debug log

        setPost({
          _id: postData._id,
          title: postData.title,
          content: processedContent, // Ensure content is a string
          image: postData.image,
          author: {
            _id: postData.author?._id || "unknown",
            name:
              typeof postData.author === "object"
                ? postData.author.name
                : postData.author,
            avatar:
              typeof postData.author === "object" && postData.author.avatar
                ? postData.author.avatar
                : "https://github.com/shadcn.png",
          },
          createdAt: postData.createdAt,
          likes: postData.likes || 0,
          comments: [],
        });

        // Extract headings from content for table of contents (removed)
        // if (processedContent) {
        //   setHeadings(extractHeadings(processedContent));
        // }

        // Get comments for this post
        try {
          const commentsData = (await commentsAPI.getCommentsByPostId(
            id
          )) as any[];
          if (commentsData && commentsData.length > 0) {
            setPost((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                comments: commentsData.map((comment: any) => ({
                  _id: comment._id,
                  content: comment.content,
                  author: {
                    _id: comment.author?._id || comment._id,
                    name:
                      typeof comment.author === "object"
                        ? comment.author.name
                        : comment.author,
                    avatar:
                      typeof comment.author === "object" &&
                      comment.author.avatar
                        ? comment.author.avatar
                        : "https://github.com/shadcn.png",
                  },
                  createdAt: comment.createdAt,
                })),
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
        const postsData: any = await postsAPI.getAllPosts();
        // Get latest 5 posts
        const latest = postsData.slice(0, 5).map((post: any) => ({
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
          : null
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
    if (!comment.trim()) return;

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment.",
        variant: "default",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new comment via API
      const commentData = {
        postId: id,
        content: comment,
      };

      const newCommentData: any = await commentsAPI.createComment(commentData);

      // Add the new comment to the post's comments
      const newComment = {
        _id: newCommentData._id,
        content: newCommentData.content,
        author: {
          _id: user?.id || "current-user",
          name: user?.username || "Current User",
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
          : null
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

  // Extract headings for table of contents - remove duplicate useEffect
  // This is now handled in the fetchPost useEffect

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

  // Component for table of contents (removed)
  // const TableOfContents = () => {
  //   if (headings.length === 0) return null;
  //
  //   return (
  //     <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 table-of-contents">
  //       <h4 className="text-lg font-semibold mb-3 text-gray-900">Mục lục</h4>
  //       <ul className="space-y-2">
  //         {headings.map((heading) => (
  //           <li
  //             key={heading.id}
  //             style={{ marginLeft: `${(heading.level - 1) * 12}px` }}
  //           >
  //             <a
  //               href={`#${heading.id}`}
  //               className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
  //             >
  //               {heading.text}
  //             </a>
  //           </li>
  //         ))}
  //       </ul>
  //     </div>
  //   );
  // };

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
                {post.content ? (
                  (() => {
                    // Check if content contains HTML tags
                    const isHtml = /<[^>]*>/g.test(post.content);

                    if (isHtml) {
                      // If content is HTML (legacy TinyMCE content), render it directly
                      return (
                        <div
                          dangerouslySetInnerHTML={{ __html: post.content }}
                          className="legacy-html-content"
                        />
                      );
                    } else {
                      // If content is Markdown, use ReactMarkdown
                      return (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children, ...props }) => {
                              const text = children?.toString() || "";
                              const id = text
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, "")
                                .replace(/\s+/g, "-");
                              return (
                                <h1 id={id} {...props}>
                                  {children}
                                </h1>
                              );
                            },
                            h2: ({ children, ...props }) => {
                              const text = children?.toString() || "";
                              const id = text
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, "")
                                .replace(/\s+/g, "-");
                              return (
                                <h2 id={id} {...props}>
                                  {children}
                                </h2>
                              );
                            },
                            h3: ({ children, ...props }) => {
                              const text = children?.toString() || "";
                              const id = text
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, "")
                                .replace(/\s+/g, "-");
                              return (
                                <h3 id={id} {...props}>
                                  {children}
                                </h3>
                              );
                            },
                            h4: ({ children, ...props }) => {
                              const text = children?.toString() || "";
                              const id = text
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, "")
                                .replace(/\s+/g, "-");
                              return (
                                <h4 id={id} {...props}>
                                  {children}
                                </h4>
                              );
                            },
                            h5: ({ children, ...props }) => {
                              const text = children?.toString() || "";
                              const id = text
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, "")
                                .replace(/\s+/g, "-");
                              return (
                                <h5 id={id} {...props}>
                                  {children}
                                </h5>
                              );
                            },
                            h6: ({ children, ...props }) => {
                              const text = children?.toString() || "";
                              const id = text
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, "")
                                .replace(/\s+/g, "-");
                              return (
                                <h6 id={id} {...props}>
                                  {children}
                                </h6>
                              );
                            },
                            code: ({ className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
                              const inline = !match;
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vs}
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
                      );
                    }
                  })()
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nội dung bài viết không khả dụng</p>
                  </div>
                )}
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
                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} className="mb-8">
                    <Textarea
                      value={comment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setComment(e.target.value)
                      }
                      placeholder="Share your thoughts..."
                      className="mb-3"
                      rows={4}
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting || !comment.trim()}
                    >
                      {isSubmitting ? "Posting..." : "Post Comment"}
                    </Button>
                  </form>
                ) : (
                  <Card className="p-4 mb-8 bg-gray-50 border border-gray-200">
                    <p className="text-center text-gray-700">
                      Vui lòng{" "}
                      <a
                        href="/auth/login"
                        className="text-blue-600 hover:underline"
                      >
                        đăng nhập
                      </a>{" "}
                      để bình luận
                    </p>
                  </Card>
                )}

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
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
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
                {/* Table of Contents removed */}

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
