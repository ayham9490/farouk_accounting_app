import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Home, BarChart3, FileText, Clipboard } from "lucide-react";
import { getLoginUrl } from "@/const";

interface AccountingDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AccountingDashboardLayout({ children }: AccountingDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const menuItems = [
    { label: "لوحة القيادة", icon: Home, path: "/" },
    { label: "اليومية", icon: FileText, path: "/daily" },
    { label: "الرصيد النهائي", icon: BarChart3, path: "/balances" },
    { label: "كشف حساب", icon: Clipboard, path: "/statement" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">صرافة الفاروق</h1>
          <p className="text-white/80 mb-8">نظام محاسبة متكامل</p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              تسجيل الدخول
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 rtl" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-primary text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold">ف</span>
            </div>
            {sidebarOpen && <span className="font-bold text-lg">الفاروق</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-light transition-colors text-right"
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-primary-dark space-y-3">
          {sidebarOpen && (
            <div className="text-sm">
              <p className="font-semibold truncate">{user?.name || "مستخدم"}</p>
              <p className="text-white/60 text-xs truncate">{user?.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-primary">صرافة الفاروق</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">مرحباً</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
