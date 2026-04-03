import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

export default function Statement() {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const { data: accounts = [] } = trpc.accounts.list.useQuery({} as any);
  const { data: transactions = [], isLoading } = trpc.transactions.byAccount.useQuery(
    selectedAccountId ? { accountId: selectedAccountId } : null as any
  );

  const calculateRunningBalance = () => {
    let balance = 0;
    return transactions.map((tx) => {
      const amount = parseFloat(tx.amount);
      if (tx.type === "لنا") {
        balance += amount;
      } else {
        balance -= amount;
      }
      return { ...tx, runningBalance: balance };
    });
  };

  const transactionsWithBalance = calculateRunningBalance();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">كشف الحساب</h1>
      </div>

      {/* Account Selection */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-3">اختر حساباً</label>
        <select
          value={selectedAccountId || ""}
          onChange={(e) => setSelectedAccountId(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">-- اختر حساباً --</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.accountType})
            </option>
          ))}
        </select>
      </Card>

      {selectedAccount && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <h2 className="text-2xl font-bold text-primary mb-2">{selectedAccount.name}</h2>
          <p className="text-gray-600">
            نوع الحساب: <span className="font-semibold">{selectedAccount.accountType}</span>
          </p>
          {selectedAccount.description && (
            <p className="text-gray-600 mt-2">{selectedAccount.description}</p>
          )}
        </Card>
      )}

      {/* Transactions Table */}
      {selectedAccountId && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-3 text-right">التاريخ</th>
                  <th className="px-6 py-3 text-right">البيان</th>
                  <th className="px-6 py-3 text-right">النوع</th>
                  <th className="px-6 py-3 text-right">العملة</th>
                  <th className="px-6 py-3 text-right">مدين</th>
                  <th className="px-6 py-3 text-right">دائن</th>
                  <th className="px-6 py-3 text-right">الرصيد المتحرك</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : transactionsWithBalance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      لا توجد معاملات لهذا الحساب
                    </td>
                  </tr>
                ) : (
                  transactionsWithBalance.map((tx, idx) => (
                    <tr key={tx.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="px-6 py-4 text-sm">
                        {new Date(tx.transactionDate).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-6 py-4 text-sm">{tx.description || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={tx.type === "لنا" ? "badge-success" : "badge-danger"}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{tx.currency}</td>
                      <td className="px-6 py-4 text-sm">
                        {tx.type === "لنا" ? parseFloat(tx.amount).toFixed(2) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {tx.type === "لهم" ? parseFloat(tx.amount).toFixed(2) : "-"}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        <span className={tx.runningBalance >= 0 ? "text-success" : "text-danger"}>
                          {tx.runningBalance.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!selectedAccountId && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 text-lg">اختر حساباً لعرض كشف الحساب</p>
        </Card>
      )}
    </div>
  );
}
