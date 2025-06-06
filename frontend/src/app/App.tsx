import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from '../features/admin';
import { AuthRoutes, AuthGuard, ProfilePage } from '../features/auth';
import { BlogRoutes } from '../features/blog';
import ComprehensiveTest from "../comprehensive-test";
import { 
  Toaster, 
  Header, 
  Banner, 
  Section, 
  BreakPage, 
  BlogSlider, 
  Footer 
} from '../shared/components';
import { AuthProvider, ThemeProvider } from '../shared/contexts';

import '../styles/App.css'

function FrontendLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
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
      <ThemeProvider>
        <Router>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <AuthGuard allowedRoles={['admin']}>
                  <AdminDashboard />
                </AuthGuard>
              }
            />
            <Route path="/auth/*" element={<AuthRoutes />} />
            <Route path="/test-markdown" element={<ComprehensiveTest />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/blog/*" element={<BlogRoutes />} />
            <Route path="/*" element={<FrontendLayout />} />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App
