import { Routes, Route } from 'react-router-dom';
import BlogDetailPage from './pages/BlogDetailPage';
import BlogCategoryPage from './pages/BlogCategoryPage';

export const BlogRoutes = () => {
  
  return (
    <Routes>
      <Route path=":id" element={<BlogDetailPage />} />
      <Route path="category/:categoryId" element={<BlogCategoryPage />} />
      {/* Trong tương lai có thể thêm các route khác ở đây, ví dụ:
        <Route path="category/:categoryId" element={<BlogCategoryPage />} />
        <Route path="tag/:tagName" element={<BlogTagPage />} />
        <Route path="author/:authorId" element={<BlogAuthorPage />} />
        <Route path="search" element={<BlogSearchPage />} />
      */}
    </Routes>
  );
};
