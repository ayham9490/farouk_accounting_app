import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import AccountingDashboardLayout from "@/components/AccountingDashboardLayout";
import { BarChart3, TrendingUp, TrendingDown, Users, ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="mb-8 animate-fade-in-up">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                <img 
                  src="/favicon.ico" 
                  alt="شام للحوالات الدولية" 
                  className="w-32 h-32 mx-auto rounded-2xl shadow-2xl relative z-10 hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">شام للحوالات</h1>
            <p className="text-white/80 text-lg">نظام محاسبة متكامل</p>
          </div>
          <p className="text-white/70 mb-8 text-base leading-relaxed">
            نظام محاسبي احترافي لإدارة المعاملات والأرصدة والحسابات بكفاءة عالية
          </p>
          <a href={getLoginUrl()} className="block">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 w-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]"
            >
              تسجيل الدخول
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <AccountingDashboardLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header with Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl"></div>
            <img 
              src="/favicon.ico" 
              alt="شام للحوالات الدولية" 
              className="w-24 h-24 rounded-2xl shadow-lg relative z-10" 
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Transactions */}
          <div className="stat-card group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary/60">إجمالي</span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-2">إجمالي المعاملات</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>

          {/* Positive Balances */}
          <div className="stat-card group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600/60">موجب</span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-2">الأرصدة الموجبة</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>

          {/* Negative Balances */}
          <div className="stat-card group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs font-semibold text-red-600/60">سالب</span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-2">الأرصدة السالبة</h3>
            <p className="text-3xl font-bold text-red-600">0</p>
          </div>

          {/* Total Accounts */}
          <div className="stat-card group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-xs font-semibold text-cyan-600/60">عدد</span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-2">عدد الحسابات</h3>
            <p className="text-3xl font-bold text-cyan-600">0</p>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="card-modern p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">مرحباً بك في نظام شام المحاسبي</h2>
          <p className="text-muted-foreground mb-8">
            اختر من القائمة الجانبية للبدء في إدارة معاملاتك المحاسبية بكفاءة وسهولة
          </p>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Daily Transactions */}
            <button
              onClick={() => navigate("/daily")}
              className="group relative p-6 border-2 border-primary/20 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 text-right overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <BarChart3 className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                </div>
                <h3 className="font-bold text-primary mb-2 text-lg">سجل المعاملات</h3>
                <p className="text-sm text-muted-foreground">عرض وإدارة المعاملات اليومية</p>
              </div>
            </button>

            {/* Balances */}
            <button
              onClick={() => navigate("/balances")}
              className="group relative p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-300 text-right overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <ArrowRight className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                </div>
                <h3 className="font-bold text-green-600 mb-2 text-lg">الأرصدة النهائية</h3>
                <p className="text-sm text-muted-foreground">عرض أرصدة جميع الحسابات</p>
              </div>
            </button>

            {/* Account Statement */}
            <button
              onClick={() => navigate("/statement")}
              className="group relative p-6 border-2 border-cyan-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-all duration-300 text-right overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-cyan-500/10 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <BarChart3 className="w-5 h-5 text-cyan-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <ArrowRight className="w-4 h-4 text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                </div>
                <h3 className="font-bold text-cyan-600 mb-2 text-lg">كشف الحساب</h3>
                <p className="text-sm text-muted-foreground">عرض تفاصيل حركات الحساب</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AccountingDashboardLayout>
  );
}
