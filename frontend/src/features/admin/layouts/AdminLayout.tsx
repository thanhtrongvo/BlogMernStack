import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Tag,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/shared/contexts/AuthContext";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Tổng quan",
      path: "/admin",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Bài viết",
      path: "/admin/posts",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Người dùng",
      path: "/admin/users",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Bình luận",
      path: "/admin/comments",
    },
    {
      icon: <Tag className="w-5 h-5" />,
      label: "Danh mục",
      path: "/admin/categories",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Cài đặt",
      path: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-gray-700">
              Go Dev Blog
            </span>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm">← Quay lại Blog</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`lg:ml-64 min-h-screen flex flex-col transition-all duration-200 ease-in-out`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    {user?.username ?? "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email ?? ""}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
