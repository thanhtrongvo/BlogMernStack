import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "../features/admin";
import { BlogRoutes, CategoryRoutes } from "../features/blog";
import {
  Toaster,
  Header,
  Banner,
  Section,
  BreakPage,
  BlogSlider,
  Footer,
} from "../shared/components";
import { AuthProvider } from "../shared/contexts";

import "../styles/App.css";

function FrontendLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Banner onSearch={(term: string) => console.log(term)} />
        <Section />
        <BreakPage />
        <BlogSlider />
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
