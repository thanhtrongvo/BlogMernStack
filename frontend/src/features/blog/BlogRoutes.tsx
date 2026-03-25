import { Routes, Route } from "react-router-dom";
import BlogDetailPage from "./pages/BlogDetailPage";
import CategoryPage from "./pages/CategoryPage";

export const BlogRoutes = () => {
  return (
    <Routes>
      <Route path=":slug" element={<BlogDetailPage />} />
    </Routes>
  );
};

export const CategoryRoutes = () => {
  return (
    <Routes>
      <Route path=":slug" element={<CategoryPage />} />
    </Routes>
  );
};
