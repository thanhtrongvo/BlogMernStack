import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AdminDashboard } from "../features/admin";
import { BlogRoutes, CategoryRoutes } from "../features/blog";
import {
  Toaster,
  Header,
  HeroBanner,
  FeaturesSection,
  FeaturedPosts,
  AllPostsSection,
  NewsletterSection,
  Footer,
} from "../shared/components";
import { AuthProvider } from "../shared/contexts";
import AboutPage from "../pages/AboutPage";

import "../styles/App.css";
import { useEffect } from "react";

function FrontendLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroBanner onSearch={(term: string) => console.log(term)} />
        <FeaturesSection />
        <FeaturedPosts />
        <AllPostsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/blog/*" element={<BlogRoutes />} />
          <Route path="/category/*" element={<CategoryRoutes />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/*" element={<FrontendLayout />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
