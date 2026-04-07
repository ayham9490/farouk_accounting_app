import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, DollarSign, EuroIcon } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">سجل المعاملات اليومية</h1>
        <div className="flex gap-2">
          {/* نموذج إضافة معاملة يورو مع تكلفة دولار */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2">
                <Plus size={20} />
                إضافة معاملة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة معاملة يورو</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الحساب (زبون)</label>
                  <select name="customerAccountId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
                  <select name="officeAccountId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
              <Button className="bg-blue-600 text-white hover:bg-blue-700 gap-2">
                <Plus size={20} />
                إدخال دفعة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إدخال بيانات دفعة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBatchTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الحساب</label>
                  <select name="accountId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
                  <select name="currency" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">اختر عملة</option>
                    <option value="دولار">دولار</option>
                    <option value="يورو">يورو</option>
                    <option value="ليرة سورية">ليرة سورية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">القيمة</label>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" value="لنا" required />
                      <span>لنا</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" value="لهم" required />
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
              <Button className="bg-amber-600 text-white hover:bg-amber-700 gap-2">
                <EuroIcon size={20} />
                قص يورو
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>نموذج قص اليورو</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEuroExchange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">المكتب</label>
                  <select name="officeAccountId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">الناتج سيتم حسابه تلقائياً</p>
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

      {/* Search and Filter */}
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="ابحث عن معاملة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">جميع العملات</option>
          <option value="دولار">دولار</option>
          <option value="يورو">يورو</option>
          <option value="ليرة سورية">ليرة سورية</option>
        </select>
      </div>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">لا توجد معاملات</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                  <th className="px-4 py-3 text-right">الحساب</th>
                  <th className="px-4 py-3 text-right">البيان</th>
                  <th className="px-4 py-3 text-right">المبلغ</th>
                  <th className="px-4 py-3 text-right">العملة</th>
                  <th className="px-4 py-3 text-right">النوع</th>
                  <th className="px-4 py-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  return (
                    <tr key={tx.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-sm">{new Date(tx.transactionDate).toLocaleDateString("ar-SA")}</td>
                      <td className="px-4 py-3 text-sm">{account?.name || "غير معروف"}</td>
                      <td className="px-4 py-3 text-sm">{tx.description}</td>
                      <td className="px-4 py-3 text-sm font-medium">{tx.amount}</td>
                      <td className="px-4 py-3 text-sm">{tx.currency}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={tx.type === "لنا" ? "text-success" : "text-danger"}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => deleteMutation.mutate({ id: tx.id })}
                          className="text-danger hover:text-danger/80"
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
  );
}
