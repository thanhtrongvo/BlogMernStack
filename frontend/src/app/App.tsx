import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "../features/admin";
import { BlogRoutes, CategoryRoutes } from "../features/blog";
import {
  Toaster,
  Header,
  HeroBanner,
  StatsSection,
  FeaturesSection,
  FeaturedPosts,
  AllPostsSection,
  NewsletterSection,
  Footer,
} from "../shared/components";
import { AuthProvider } from "../shared/contexts";

import "../styles/App.css";

function FrontendLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroBanner onSearch={(term: string) => console.log(term)} />
        <StatsSection />
        <FeaturesSection />
        <FeaturedPosts />
        <AllPostsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/blog/*" element={<BlogRoutes />} />
          <Route path="/category/*" element={<CategoryRoutes />} />
          <Route path="/*" element={<FrontendLayout />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
