import { Routes, Route } from "react-router-dom";
import BlogDetailPage from "./pages/BlogDetailPage";

export const BlogRoutes = () => {
  return (
    <Routes>
      <Route path=":id" element={<BlogDetailPage />} />
      {/* Trong tương lai có thể thêm các route khác ở đây, ví dụ:
        <Route path="category/:categoryId" element={<BlogCategoryPage />} />
        <Route path="tag/:tagName" element={<BlogTagPage />} />
        <Route path="author/:authorId" element={<BlogAuthorPage />} />
        <Route path="search" element={<BlogSearchPage />} />
      */}
    </Routes>
  );
};
