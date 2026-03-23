import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { PostsPage } from "./pages/PostsPage";
import { UsersPage } from "./pages/UsersPage";
import { CommentsPage } from "./pages/CommentsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { PostEditorPage } from "./pages/PostEditorPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AuthGuard } from "../auth/components/AuthGuard";
import { Routes, Route } from "react-router-dom";

export function AdminDashboard() {
  return (
    <Routes>
      {/* Public login route — no auth required */}
      <Route path="login" element={<AdminLoginPage />} />

      {/* Protected dashboard routes */}
      <Route
        path="/"
        element={
          <AuthGuard allowedRoles={["admin"]} fallbackPath="/admin/login">
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="posts/new" element={<PostEditorPage />} />
        <Route path="posts/edit/:id" element={<PostEditorPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="comments" element={<CommentsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
