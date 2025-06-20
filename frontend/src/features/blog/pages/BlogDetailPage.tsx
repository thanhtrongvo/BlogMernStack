import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { postsAPI, commentsAPI } from '../../../shared/services/api';
import { useAuth } from '../../../shared/contexts';
import { Eye, Calendar, User, Tag, MessageCircle, ArrowLeft, Share2, Heart } from 'lucide-react';
import { BlogLayout } from '../layouts/BlogLayout';
import { LatestPosts } from '../components/LatestPosts';
import type { ApiPost, ApiComment } from '../../../shared/types';

function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<ApiPost | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  

  console.log(user);
  useEffect(() => {
    if (!id) {
      setError('ID bài viết không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postsAPI.getPostById(id) as ApiPost;
        setPost(response);
        
        // Track view
        await postsAPI.trackPostView(id);
      } catch (err) {
        setError('Không thể tải bài viết');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const response = await commentsAPI.getCommentsByPostId(id) as ApiComment[];
        setComments(response);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchPost();
    fetchComments();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!commentText.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await commentsAPI.createComment({
        content: commentText,
        postId: id!,
        author: user
      }) as ApiComment;
      
      setComments(prev => [response, ...prev]);
      setCommentText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Không thể gửi bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link bài viết');
    }
  };

  if (loading) {
    return (
      <BlogLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-300 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </BlogLayout>
    );
  }

  if (error || !post) {
    return (
      <BlogLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Không tìm thấy bài viết'}
            </h2>
            <button
              onClick={() => navigate('/blog')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Quay lại trang blog
            </button>
          </div>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="lg:w-2/3">
              {/* Navigation */}
              <div className="mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Quay lại
                </button>
              </div>

              {/* Post Header */}
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{typeof post.author === 'string' ? post.author : post.author.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{post.views} lượt xem</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>{comments.length} bình luận</span>
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Link
                    to={`/blog/category/${post.category._id}`}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {post.category.name}
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pb-6 border-b">
                  <button
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Chia sẻ
                  </button>
                  <button className="flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                    <Heart className="w-4 h-4 mr-2" />
                    Yêu thích
                  </button>
                </div>
              </header>

              {/* Featured Image */}
              {post.image && (
                <div className="mb-8">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="prose prose-lg max-w-none mb-12 bg-white rounded-lg p-8 shadow-sm">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-900">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 bg-blue-50 py-2">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto mb-4">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Comments Section */}
              <section className="bg-white rounded-lg p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Bình luận ({comments.length})
                </h3>

                {/* Comment Form */}
                {user ? (
                  <form onSubmit={handleSubmitComment} className="mb-8">
                    <div className="mb-4">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submittingComment}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                    </button>
                  </form>
                ) : (
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      <Link to="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                        Đăng nhập
                      </Link>
                      {' '}để có thể bình luận
                    </p>
                  </div>
                )}

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment._id} className="flex space-x-3">
                        <img
                          src="https://secure.gravatar.com/avatar/9be0621ecc601641f92b127feaf5f3ba6119d27f5e16ec987d1beeb8174c35dd?s=70&d=mm&r=g"
                          alt={user?.username || 'Người dùng ẩn danh'}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {user?.username || 'Người dùng ẩn danh'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>

                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </p>
                )}
              </section>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <LatestPosts currentPostId={post._id} limit={5} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </BlogLayout>
  );
}

export default BlogDetailPage;