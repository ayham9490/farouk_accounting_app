import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import AccountingDashboardLayout from "@/components/AccountingDashboardLayout";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <img src="/favicon.ico" alt="شاهم للحوالات الدولية" className="w-32 h-32 mx-auto mb-4 rounded-lg shadow-lg" />
            <h1 className="text-5xl font-bold text-white mb-2">الفاروق</h1>
            <p className="text-white/80 text-lg">نظام محاسبة متكامل</p>
          </div>
          <p className="text-white/70 mb-8">
            نظام محاسبي احترافي لإدارة المعاملات والأرصدة والحسابات بكفاءة عالية
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 w-full">
              تسجيل الدخول
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <AccountingDashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-center mb-8">
          <img src="/favicon.ico" alt="شاهم للحوالات الدولية" className="w-24 h-24 rounded-lg shadow-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-r-4 border-primary">
            <h3 className="text-gray-600 text-sm font-medium mb-2">إجمالي المعاملات</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-r-4 border-success">
            <h3 className="text-gray-600 text-sm font-medium mb-2">الأرصدة الموجبة</h3>
            <p className="text-3xl font-bold text-success">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-r-4 border-danger">
            <h3 className="text-gray-600 text-sm font-medium mb-2">الأرصدة السالبة</h3>
            <p className="text-3xl font-bold text-danger">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-r-4 border-accent">
            <h3 className="text-gray-600 text-sm font-medium mb-2">عدد الحسابات</h3>
            <p className="text-3xl font-bold text-accent">0</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-primary mb-4">مرحباً بك في نظام الفاروق المحاسبي</h2>
          <p className="text-gray-600 mb-6">
            اختر من القائمة الجانبية للبدء في إدارة معاملاتك المحاسبية
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/daily")}
              className="p-4 border-2 border-primary rounded-lg hover:bg-primary/5 transition-colors text-right"
            >
              <h3 className="font-bold text-primary mb-2">سجل المعاملات اليومية</h3>
              <p className="text-sm text-gray-600">عرض وإدارة جميع المعاملات اليومية</p>
            </button>
            <button
              onClick={() => navigate("/balances")}
              className="p-4 border-2 border-success rounded-lg hover:bg-success/5 transition-colors text-right"
            >
              <h3 className="font-bold text-success mb-2">الأرصدة النهائية</h3>
              <p className="text-sm text-gray-600">عرض أرصدة جميع الحسابات</p>
            </button>
            <button
              onClick={() => navigate("/statement")}
              className="p-4 border-2 border-accent rounded-lg hover:bg-accent/5 transition-colors text-right"
            >
              <h3 className="font-bold text-accent mb-2">كشف الحساب</h3>
              <p className="text-sm text-gray-600">عرض تفاصيل حركات الحساب</p>
            </button>
          </div>
        </div>
      </div>
    </AccountingDashboardLayout>
  );
}
