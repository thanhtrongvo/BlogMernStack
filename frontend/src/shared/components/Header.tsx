import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { categoriesAPI } from "@/shared/services/api";

// Category interface
interface Category {
  _id: string;
  name: string;
  description: string;
  status: string;
}

// Utility: Generate slug from text
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getPublicCategories();
        setCategories(data as Category[]);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // If API fails, use fallback categories
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 relative">
        {/* Logo */}
        <Link to="/" className="z-10 group flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
            <span className="text-white font-bold text-xl leading-none">G</span>
          </div>
          <h1 className="font-extrabold text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
            Go Blog
          </h1>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-primary focus:outline-none z-10"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:block mx-auto absolute left-0 right-0">
          <ul className="flex justify-center space-x-8">
            {isLoading ? (
              // Loading state - show skeleton placeholders
              <>
                <li>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </li>
                <li>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </li>
                <li>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </li>
              </>
            ) : categories.length > 0 ? (
              // Show categories
              categories.map((category) => (
                <li key={category._id}>
                  <Link
                    to={`/category/${slugify(category.name)}-${category._id}`}
                    className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group"
                  >
                    {category.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))
            ) : (
              // Fallback categories if none were loaded
              <>
                <li>
                  <Link
                    to="#"
                    className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group"
                  >
                    Học Tập
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group"
                  >
                    Thủ Thuật
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group"
                  >
                    Kể Chuyện
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group"
                  >
                    Tin Tức
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Mobile Navigation - Full screen overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-20 flex flex-col pt-20 pb-6 px-6 md:hidden">
            <nav className="flex-1">
              <ul className="flex flex-col space-y-6 items-center pt-4">
                {isLoading ? (
                  // Loading state - show skeleton placeholders
                  <>
                    <li>
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </li>
                    <li>
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </li>
                    <li>
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </li>
                  </>
                ) : categories.length > 0 ? (
                  // Show categories
                  categories.map((category) => (
                    <li key={category._id} className="w-full text-center">
                      <Link
                        to={`/category/${slugify(category.name)}-${category._id}`}
                        className="text-gray-700 hover:text-primary font-medium transition-colors text-lg block py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  // Fallback categories if none were loaded
                  <>
                    <li className="w-full text-center">
                      <Link
                        to="#"
                        className="text-gray-700 hover:text-primary font-medium transition-colors text-lg block py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Học Tập
                      </Link>
                    </li>
                    <li className="w-full text-center">
                      <Link
                        to="#"
                        className="text-gray-700 hover:text-primary font-medium transition-colors text-lg block py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Thủ Thuật
                      </Link>
                    </li>
                    <li className="w-full text-center">
                      <Link
                        to="#"
                        className="text-gray-700 hover:text-primary font-medium transition-colors text-lg block py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Kể Chuyện
                      </Link>
                    </li>
                    <li className="w-full text-center">
                      <Link
                        to="#"
                        className="text-gray-700 hover:text-primary font-medium transition-colors text-lg block py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Tin Tức
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            {/* Mobile Auth Buttons removed */}
            <div className="flex flex-col space-y-3 mt-8 w-full"></div>
          </div>
        )}

        <div className="hidden md:flex items-center space-x-2 z-10">
          {/* Desktop Auth removed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
