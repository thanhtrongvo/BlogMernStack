import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../../../shared/services';
import type { ApiPost } from '../../../shared/types';

interface LatestPostsProps {
  currentPostId?: string;
  limit?: number;
}

export function LatestPosts({ currentPostId, limit = 6 }: LatestPostsProps) {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true);
        const response = await postsAPI.getAllPosts() as ApiPost[];
        
        // Filter out current post if specified
        const filteredPosts = currentPostId 
          ? response.filter((post: ApiPost) => post._id !== currentPostId)
          : response;
        
        setPosts(filteredPosts.slice(0, limit));
      } catch (err) {
        setError('Không thể tải bài viết mới nhất');
        console.error('Error fetching latest posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, [currentPostId, limit]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Bài viết mới nhất</h3>
      {posts.map((post) => (
        <Link
          key={post._id}
          to={`/blog/posts/${post._id}`}
          className="block group hover:bg-gray-50 rounded-lg p-3 transition-colors"
        >
          <div className="flex space-x-4">
            {post.image && (
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>{post.views || 0} lượt xem</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
