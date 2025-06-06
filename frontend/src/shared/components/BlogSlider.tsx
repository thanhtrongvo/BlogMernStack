import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./BlogSlider.css";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import type { ApiPost } from "../types";

const BlogSlider = () => {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await postsAPI.getAllPosts() as ApiPost[];
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          arrows: true
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="blog-slider-container">
        <div className="animate-pulse flex space-x-6">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-56 bg-gray-200 rounded-2xl"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-56 bg-gray-200 rounded-2xl"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-56 bg-gray-200 rounded-2xl"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-slider-container">
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-700">No blog posts available</h3>
          <p className="text-gray-500 mt-2">Check back later for new content!</p>
        </div>
      ) : (
        <Slider className="blog-slider" {...settings}>
          {posts.map((post) => (
            <div className="blog-slide-item" key={post._id}>
              <Link to={`/blog/${post._id}`} className="block">
                <div className="blog-card">
                  <div className="blog-image-container">
                    <img 
                      src={post.image} 
                      className="blog-image" 
                      alt={post.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                      }}
                    />
                    <div className="blog-category-badge">
                      {post.category?.name || 'Chưa phân loại'}
                    </div>
                  </div>
                  <div className="blog-content">
                    <h2 className="blog-title">
                      {post.title}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default BlogSlider;
