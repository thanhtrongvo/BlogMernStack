import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { LogOut, User, Settings, Shield, Menu, X, Sun, Moon } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useAuth, useTheme } from "@/shared/contexts";
import { useEffect, useState } from "react";
import { categoriesAPI } from "@/shared/services/api";

// Category interface
interface Category {
    _id: string;
    name: string;
    description: string;
    status: string;
}

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { toast } = useToast();
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
                console.error('Error fetching categories:', error);
                // If API fails, use fallback categories
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            toast({
                title: "Đăng xuất thành công",
                description: "Bạn đã đăng xuất khỏi tài khoản",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Lỗi đăng xuất",
                description: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className="sticky top-0 z-30 bg-white shadow-md">
            <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 relative">
                {/* Logo */}
                <h1 className="font-bold text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 z-10">My Application</h1>
                
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
                                <li><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></li>
                                <li><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></li>
                                <li><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></li>
                            </>
                        ) : categories.length > 0 ? (
                            // Show categories
                            categories.map(category => (
                                <li key={category._id}>
                                    <Link 
                                        to={`/category/${category._id}`} 
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
                                    <Link to="#" className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group">
                                        Học Tập
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group">
                                        Thủ Thuật
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group">
                                        Kể Chuyện
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-gray-700 hover:text-primary font-medium transition-colors relative py-2 group">
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
                                        <li><div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div></li>
                                        <li><div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div></li>
                                        <li><div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div></li>
                                    </>
                                ) : categories.length > 0 ? (
                                    // Show categories
                                    categories.map(category => (
                                        <li key={category._id} className="w-full text-center">
                                            <Link 
                                                to={`/category/${category._id}`} 
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
                        
                        {/* Mobile Auth Buttons */}
                        <div className="flex flex-col space-y-3 mt-8 w-full">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center justify-center space-x-3 bg-gray-50 p-4 rounded-lg">
                                        <Avatar className="h-10 w-10 border border-gray-200 ring-2 ring-primary/20">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                    
                                    <Link 
                                        to="/profile" 
                                        className="flex items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <User className="mr-3 h-5 w-5" />
                                        <span>Trang cá nhân</span>
                                    </Link>
                                    
                                    {user.role === 'admin' && (
                                        <Link 
                                            to="/admin" 
                                            className="flex items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Shield className="mr-3 h-5 w-5" />
                                            <span>Quản trị</span>
                                        </Link>
                                    )}
                                    
                                    <Link 
                                        to="#" 
                                        className="flex items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Settings className="mr-3 h-5 w-5" />
                                        <span>Cài đặt</span>
                                    </Link>
                                    
                                    <button 
                                        className="flex items-center p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <LogOut className="mr-3 h-5 w-5" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Button 
                                        variant="outline" 
                                        className="w-full py-6 rounded-lg border-gray-300 hover:bg-gray-100 hover:text-primary transition-colors"
                                        asChild
                                    >
                                        <Link 
                                            to="/auth/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Đăng Nhập
                                        </Link>
                                    </Button>
                                    <Button 
                                        className="w-full py-6 rounded-lg transition-transform hover:brightness-110"
                                        asChild
                                    >
                                        <Link 
                                            to="/auth/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Đăng Ký
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Desktop Auth & Theme Toggle */}
                <div className="hidden md:flex items-center space-x-4 z-10"> {/* Increased space-x for new button */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full w-9 h-9 border-gray-300 hover:bg-gray-100 hover:text-primary transition-colors"
                        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </Button>

                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none hover:opacity-80 transition-opacity">
                                <Avatar className="h-9 w-9 border border-gray-200 ring-2 ring-primary/20">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg shadow-lg border-gray-200">
                                <div className="px-2 py-2 text-sm bg-gray-50 rounded-md mb-1">
                                    <div className="font-medium">{user.username}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer rounded-md transition-colors hover:bg-gray-100" asChild>
                                    <Link to="/profile">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Trang cá nhân</span>
                                    </Link>
                                </DropdownMenuItem>
                                {user.role === 'admin' && (
                                    <DropdownMenuItem className="cursor-pointer rounded-md transition-colors hover:bg-gray-100" asChild>
                                        <Link to="/admin">
                                            <Shield className="mr-2 h-4 w-4" />
                                            <span>Quản trị</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="cursor-pointer rounded-md transition-colors hover:bg-gray-100">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Cài đặt</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer rounded-md transition-colors hover:bg-red-50 text-red-600 hover:text-red-700" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full px-4 border-gray-300 hover:bg-gray-100 hover:text-primary transition-colors"
                                asChild
                            >
                                <Link to="/auth/login">Đăng Nhập</Link>
                            </Button>
                            <Button 
                                size="sm"
                                className="rounded-full px-4 transition-transform hover:scale-105"
                                asChild
                            >
                                <Link to="/auth/register">Đăng Ký</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;