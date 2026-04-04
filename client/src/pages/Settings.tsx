import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsIcon, Link2, Database, Bell, Lock } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");
  const [appScriptUrl, setAppScriptUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleGoogleSheetsConnect = () => {
    if (!googleSheetsUrl || !appScriptUrl) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setIsSyncing(true);
    // محاكاة عملية الربط
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("تم الربط مع Google Sheets بنجاح!");
      localStorage.setItem("googleSheetsUrl", googleSheetsUrl);
      localStorage.setItem("appScriptUrl", appScriptUrl);
    }, 2000);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("تم مزامنة البيانات بنجاح!");
    }, 2000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">الإعدادات</h1>
      </div>

      <Tabs defaultValue="google-sheets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="google-sheets">Google Sheets</TabsTrigger>
          <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
        </TabsList>

        {/* Google Sheets Tab */}
        <TabsContent value="google-sheets" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">ربط Google Sheets</h2>
            <p className="text-gray-600 mb-6">
              قم بربط تطبيقك مع Google Sheets لمزامنة البيانات تلقائياً. يمكنك استخدام Google Apps Script لإنشاء API مخصص.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">رابط Google Sheets</label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={googleSheetsUrl}
                  onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رابط Google Apps Script</label>
                <Input
                  type="url"
                  placeholder="https://script.google.com/macros/d/..."
                  value={appScriptUrl}
                  onChange={(e) => setAppScriptUrl(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">خطوات الربط:</h3>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>انسخ رابط Google Sheets الخاص بك</li>
                  <li>افتح Google Apps Script من قائمة الأدوات في Sheets</li>
                  <li>أنشئ دالة لمزامنة البيانات</li>
                  <li>انشر الـ Script كـ Web App</li>
                  <li>الصق رابط Web App هنا</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGoogleSheetsConnect}
                  disabled={isSyncing}
                  className="btn-primary gap-2"
                >
                  <Link2 className="w-5 h-5" />
                  {isSyncing ? "جاري الربط..." : "ربط الآن"}
                </Button>
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  variant="outline"
                  className="gap-2"
                >
                  {isSyncing ? "جاري المزامنة..." : "مزامنة يدوية"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">إدارة قاعدة البيانات</h2>

            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">حالة قاعدة البيانات</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p>✓ الاتصال: متصل</p>
                  <p>✓ الجداول: 5 جداول نشطة</p>
                  <p>✓ السجلات: تم تحديثها للتو</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">الخيارات المتقدمة</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-5 h-5 mr-2" />
                    عمل نسخة احتياطية من البيانات
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-5 h-5 mr-2" />
                    استعادة من نسخة احتياطية
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600">
                    <Database className="w-5 h-5 mr-2" />
                    حذف جميع البيانات (غير قابل للتراجع)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">إعدادات الإشعارات</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">إشعارات المعاملات</h3>
                  <p className="text-sm text-gray-600">تلقي إشعارات عند إضافة معاملات جديدة</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">تنبيهات الأرصدة</h3>
                  <p className="text-sm text-gray-600">تنبيهات عند انخفاض الأرصدة عن حد معين</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">تقارير يومية</h3>
                  <p className="text-sm text-gray-600">استقبل ملخص يومي للمعاملات</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">تقارير أسبوعية</h3>
                  <p className="text-sm text-gray-600">استقبل ملخص أسبوعي للأرصدة</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>

              <Button className="w-full btn-primary mt-4">حفظ الإعدادات</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">إعدادات الأمان</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  كلمة المرور
                </h3>
                <Button variant="outline" className="w-full justify-start">
                  تغيير كلمة المرور
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-3">المصادقة الثنائية</h3>
                <div className="bg-yellow-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-yellow-800">المصادقة الثنائية غير مفعلة حالياً</p>
                </div>
                <Button className="w-full btn-primary">تفعيل المصادقة الثنائية</Button>
              </div>

              <div>
                <h3 className="font-semibold mb-3">جلسات نشطة</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">جلسة واحدة نشطة حالياً</p>
                  <Button variant="outline" className="w-full mt-3">
                    تسجيل الخروج من جميع الأجهزة
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
