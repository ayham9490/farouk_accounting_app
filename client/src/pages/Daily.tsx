import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, DollarSign, EuroIcon, Search, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import AccountingDashboardLayout from "@/components/AccountingDashboardLayout";

export default function Daily() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isEuroDialogOpen, setIsEuroDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  // Fetch transactions
  const { data: transactions = [], isLoading, refetch } = trpc.transactions.list.useQuery({ limit: 100 } as any);
  const { data: accounts = [] } = trpc.accounts.list.useQuery({} as any);

  // Create transaction mutation
  const createMutation = trpc.transactions.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المعاملة بنجاح");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // Delete transaction mutation
  const deleteMutation = trpc.transactions.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المعاملة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // النموذج الجديد: إضافة معاملة يورو مع تكلفة دولار
  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const customerAccountId = parseInt(formData.get("customerAccountId") as string);
    const officeAccountId = parseInt(formData.get("officeAccountId") as string);
    const euroAmount = formData.get("euroAmount") as string;
    const dollarCost = formData.get("dollarCost") as string;
    const description = formData.get("description") as string;

    // معاملة 1: إضافة اليورو للزبون (لنا)
    createMutation.mutate({
      accountId: customerAccountId,
      amount: euroAmount,
      currency: "يورو",
      description: description,
      type: "لنا",
      transactionDate: new Date(),
    });

    // معاملة 2: إضافة التكلفة بالدولار للشركة (لهم)
    setTimeout(() => {
      createMutation.mutate({
        accountId: officeAccountId,
        amount: dollarCost,
        currency: "دولار",
        description: description,
        type: "لهم",
        transactionDate: new Date(),
      });
    }, 300);

    setIsDialogOpen(false);
    toast.success("تم إضافة المعاملة بنجاح");
  };

  const handleAddBatchTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      accountId: parseInt(formData.get("accountId") as string),
      amount: formData.get("amount") as string,
      currency: formData.get("currency") as any,
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      transactionDate: new Date(),
    });
  };

  const handleEuroExchange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const euroAmount = parseFloat(formData.get("euroAmount") as string);
    const exchangeRate = parseFloat(formData.get("exchangeRate") as string);
    const result = euroAmount * exchangeRate;

    // إضافة معاملتين: طرح اليورو من حسابنا لدى المكتب وإضافة الدولار
    const officeAccountId = parseInt(formData.get("officeAccountId") as string);

    // معاملة 1: طرح اليورو (لهم)
    createMutation.mutate({
      accountId: officeAccountId,
      amount: euroAmount.toString(),
      currency: "يورو",
      description: `قص يورو - ${formData.get("description")}`,
      type: "لهم",
      transactionDate: new Date(),
    });

    // معاملة 2: إضافة الدولار (لنا)
    setTimeout(() => {
      createMutation.mutate({
        accountId: officeAccountId,
        amount: result.toString(),
        currency: "دولار",
        description: `ناتج قص يورو - ${formData.get("description")}`,
        type: "لنا",
        transactionDate: new Date(),
      });
    }, 500);

    setIsEuroDialogOpen(false);
    toast.success(`تم معالجة قص اليورو: ${euroAmount} يورو = ${result.toFixed(2)} دولار`);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const account = accounts.find((a) => a.id === tx.accountId);
    const matchesSearch =
      !searchQuery ||
      account?.name.includes(searchQuery) ||
      tx.description?.includes(searchQuery);
    const matchesCurrency = !selectedCurrency || tx.currency === selectedCurrency;
    return matchesSearch && matchesCurrency;
  });

  // تصفية الحسابات حسب النوع
  const customerAccounts = accounts.filter((a) => a.accountType === "زبون");
  const officeAccounts = accounts.filter((a) => a.accountType === "مكتب");

  // حساب الإحصائيات
  const stats = {
    total: filteredTransactions.length,
    forUs: filteredTransactions.filter((t) => t.type === "لنا").length,
    forThem: filteredTransactions.filter((t) => t.type === "لهم").length,
  };

  return (
    <AccountingDashboardLayout>
      <div className="space-y-8 animate-fade-in-up" dir="rtl">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">سجل المعاملات اليومية</h1>
              <p className="text-muted-foreground">إدارة وتتبع جميع معاملاتك اليومية</p>
            </div>
            <div className="flex gap-3">
              {/* إضافة معاملة يورو مع تكلفة دولار */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Plus size={20} />
                    إضافة معاملة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة معاملة يورو</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddTransaction} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الحساب (زبون)</label>
                      <select name="customerAccountId" required className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">اختر حساب زبون</option>
                        {customerAccounts.map((account) => (
                          <option key={account.id} value={account.id.toString()}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">المبلغ (يورو)</label>
                      <Input type="number" name="euroAmount" placeholder="0.00" step="0.01" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">المكتب المرسل</label>
                      <select name="officeAccountId" required className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">اختر مكتباً</option>
                        {officeAccounts.map((account) => (
                          <option key={account.id} value={account.id.toString()}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">التكلفة (دولار)</label>
                      <Input type="number" name="dollarCost" placeholder="0.00" step="0.01" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">البيان</label>
                      <Input type="text" name="description" placeholder="أدخل البيان" />
                    </div>

                    <Button type="submit" className="w-full btn-primary" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Plus size={20} />
                    إدخال دفعة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-right">إدخال بيانات دفعة</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddBatchTransaction} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الحساب</label>
                      <select name="accountId" required className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">اختر حساباً</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id.toString()}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">المبلغ</label>
                      <Input type="number" name="amount" placeholder="0.00" step="0.01" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">العملة</label>
                      <select name="currency" required className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">اختر عملة</option>
                        <option value="دولار">دولار</option>
                        <option value="يورو">يورو</option>
                        <option value="ليرة سورية">ليرة سورية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">القيمة</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="type" value="لنا" required className="w-4 h-4" />
                          <span>لنا</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="type" value="لهم" required className="w-4 h-4" />
                          <span>لهم</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">البيان</label>
                      <Input type="text" name="description" placeholder="أدخل البيان" />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isEuroDialogOpen} onOpenChange={setIsEuroDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 text-white hover:bg-amber-700 gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <EuroIcon size={20} />
                    قص يورو
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-right">نموذج قص اليورو</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEuroExchange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">المكتب</label>
                      <select name="officeAccountId" required className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">اختر مكتباً</option>
                        {officeAccounts.map((account) => (
                          <option key={account.id} value={account.id.toString()}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">مبلغ اليورو</label>
                      <Input type="number" name="euroAmount" placeholder="0.00" step="0.01" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">سعر القص (دولار/يورو)</label>
                      <Input type="number" name="exchangeRate" placeholder="1.10" step="0.01" required />
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-700 dark:text-amber-300">الناتج سيتم حسابه تلقائياً</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ملاحظات</label>
                      <Input type="text" name="description" placeholder="أدخل ملاحظات إضافية" />
                    </div>

                    <Button type="submit" className="w-full bg-amber-600 text-white hover:bg-amber-700" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "جاري المعالجة..." : "معالجة"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg p-6 border border-border shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary/60">إجمالي</span>
              </div>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">معاملة</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600/60">لنا</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.forUs}</p>
              <p className="text-xs text-muted-foreground mt-1">معاملة</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-xs font-semibold text-red-600/60">لهم</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.forThem}</p>
              <p className="text-xs text-muted-foreground mt-1">معاملة</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن معاملة أو حساب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 bg-background border-input focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
          >
            <option value="">جميع العملات</option>
            <option value="دولار">دولار</option>
            <option value="يورو">يورو</option>
            <option value="ليرة سورية">ليرة سورية</option>
          </select>
        </div>

        {/* Transactions Table */}
        <Card className="overflow-hidden shadow-lg">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">جاري تحميل المعاملات...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">لا توجد معاملات</p>
              <p className="text-muted-foreground text-sm mt-2">ابدأ بإضافة معاملة جديدة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary to-primary/80 text-white sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-right font-semibold text-sm">التاريخ</th>
                    <th className="px-6 py-4 text-right font-semibold text-sm">الحساب</th>
                    <th className="px-6 py-4 text-right font-semibold text-sm">البيان</th>
                    <th className="px-6 py-4 text-right font-semibold text-sm">المبلغ</th>
                    <th className="px-6 py-4 text-right font-semibold text-sm">العملة</th>
                    <th className="px-6 py-4 text-right font-semibold text-sm">النوع</th>
                    <th className="px-6 py-4 text-right font-semibold text-sm">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((tx, index) => {
                    const account = accounts.find((a) => a.id === tx.accountId);
                    const isForUs = tx.type === "لنا";
                    return (
                      <tr 
                        key={tx.id} 
                        className={`transition-all duration-200 hover:bg-primary/5 ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/30"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {new Date(tx.transactionDate).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full">
                            {account?.name || "غير معروف"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{tx.description}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{tx.amount}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            tx.currency === "دولار" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" :
                            tx.currency === "يورو" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                            "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                          }`}>
                            {tx.currency === "دولار" && <DollarSign size={12} />}
                            {tx.currency === "يورو" && <EuroIcon size={12} />}
                            {tx.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs ${
                            isForUs 
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" 
                              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          }`}>
                            {isForUs ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => deleteMutation.mutate({ id: tx.id })}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-danger hover:bg-danger/10 transition-colors duration-200"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AccountingDashboardLayout>
  );
}
