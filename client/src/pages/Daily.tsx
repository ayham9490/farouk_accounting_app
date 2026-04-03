import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Daily() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      accountId: parseInt(formData.get("accountId") as string),
      amount: formData.get("amount") as string,
      currency: formData.get("currency") as any,
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      transactionDate: new Date(formData.get("transactionDate") as string),
    });
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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">سجل المعاملات اليومية</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary gap-2">
              <Plus size={20} />
              إضافة معاملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة معاملة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTransaction} className="space-y-4">
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
                <label className="block text-sm font-medium mb-2">النوع</label>
                <select name="type" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">اختر النوع</option>
                  <option value="لنا">لنا</option>
                  <option value="لهم">لهم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">البيان</label>
                <Input type="text" name="description" placeholder="أدخل البيان" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التاريخ</label>
                <Input type="datetime-local" name="transactionDate" required />
              </div>

              <Button type="submit" className="w-full btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="ابحث عن حساب أو بيان..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-64"
        />
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg w-40"
        >
          <option value="">جميع العملات</option>
          <option value="دولار">دولار</option>
          <option value="يورو">يورو</option>
          <option value="ليرة سورية">ليرة سورية</option>
        </select>
      </div>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-right">الحساب</th>
                <th className="px-6 py-3 text-right">المبلغ</th>
                <th className="px-6 py-3 text-right">العملة</th>
                <th className="px-6 py-3 text-right">النوع</th>
                <th className="px-6 py-3 text-right">البيان</th>
                <th className="px-6 py-3 text-right">التاريخ</th>
                <th className="px-6 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    لا توجد معاملات
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  return (
                    <tr key={tx.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="px-6 py-4 font-medium">{account?.name}</td>
                      <td className="px-6 py-4">{parseFloat(tx.amount).toFixed(2)}</td>
                      <td className="px-6 py-4">{tx.currency}</td>
                      <td className="px-6 py-4">
                        <span className={tx.type === "لنا" ? "badge-success" : "badge-danger"}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{tx.description}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(tx.transactionDate).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-200 rounded">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate({ id: tx.id })}
                            className="p-2 hover:bg-red-100 rounded text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
