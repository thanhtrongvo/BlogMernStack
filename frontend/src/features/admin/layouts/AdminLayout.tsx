import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: "Tổng quan", 
      path: "/admin" 
    },
    { 
      icon: <FileText className="w-5 h-5" />, 
      label: "Bài viết", 
      path: "/admin/posts" 
    },
    { 
      icon: <Users className="w-5 h-5" />, 
      label: "Người dùng", 
      path: "/admin/users" 
    },
    { 
      icon: <MessageSquare className="w-5 h-5" />, 
      label: "Bình luận", 
      path: "/admin/comments" 
    },
    { 
      icon: <Tag className="w-5 h-5" />, 
      label: "Danh mục", 
      path: "/admin/categories" 
    },
    { 
      icon: <Settings className="w-5 h-5" />, 
      label: "Cài đặt", 
      path: "/admin/settings" 
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground"> {/* Themed background and text */}
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-card text-card-foreground border-r border-border shadow-sm transform transition-transform duration-200 ease-in-out ${ /* Themed sidebar */
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 border-b border-border"> {/* Themed border */}
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground/70">Go Dev Blog</span> {/* Themed gradient text */}
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
                      ? "bg-primary/10 text-primary" // Active state is good
                      : "text-muted-foreground hover:bg-muted hover:text-foreground" // Themed inactive state
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-border"> {/* Themed border */}
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"> {/* Themed link */}
            <LogOut className="w-5 h-5" />
            <span>Quay lại Blog</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className={`lg:ml-64 min-h-screen flex flex-col transition-all duration-200 ease-in-out bg-background`}> {/* Ensured main content area also has bg-background if sidebar doesn't overlap */}
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card text-card-foreground border-b border-border shadow-sm"> {/* Themed header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                  <p className="text-sm font-medium text-foreground">Admin</p> {/* Themed text */}
                  <p className="text-xs text-muted-foreground">admin@godevblog.com</p> {/* Themed text */}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 bg-background"> {/* Ensured Outlet area has bg-background */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
