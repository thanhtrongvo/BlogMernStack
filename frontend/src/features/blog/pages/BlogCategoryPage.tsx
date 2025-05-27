import { useEffect, useState } from "react";
import { useParams } from "react-router";
import React from "react";
import { postsAPI, commentsAPI } from '../../../shared/services/api';

const BlogCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const listPosts = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // You can use the categoryId to fetch posts in this category
  // For now, we will just display the categoryId as a placeholder
  console.log("Category ID:", categoryId);
  // You can replace the above console.log with an API call to fetch posts in this category
  // Example API call (pseudo-code):

  useEffect(() => {


    const fetchPostsByCategory = async () => {
        setIsLoading(true);
        try {
            if (!categoryId) {
                console.error("No category ID provided");
                return;
            }
            const postData = await postsAPI.getPostsByCategory(categoryId);
        }
        catch (error) {
            console.error("Error fetching posts by category:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchPostsByCategory();
  }, [categoryId]);

  return (
    <div>
      <h1>Blog Category Page</h1>
      <p>This is a placeholder for the blog category page.</p>
      {/* You can add more content here, such as a list of blog posts in this category */}
    </div>
  );
};
export default BlogCategoryPage;
