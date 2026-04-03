import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function Balances() {
  const { data: balances = [], isLoading } = trpc.balances.all.useQuery({} as any);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  // Group balances by account
  const groupedBalances = balances.reduce(
    (acc, balance) => {
      const accountId = balance.accountId;
      if (!acc[accountId]) {
        acc[accountId] = {
          account: balance.account,
          currencies: {},
        };
      }
      acc[accountId].currencies[balance.currency] = balance.balance;
      return acc;
    },
    {} as Record<
      number,
      {
        account: any;
        currencies: Record<string, string>;
      }
    >
  );

  const filteredBalances = Object.values(groupedBalances).filter((item) => {
    if (!selectedCurrency) return true;
    return item.currencies[selectedCurrency] !== undefined;
  });

  const calculateTotals = () => {
    const totals: Record<string, number> = {};
    balances.forEach((balance) => {
      if (!totals[balance.currency]) {
        totals[balance.currency] = 0;
      }
      totals[balance.currency] += parseFloat(balance.balance);
    });
    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">الأرصدة النهائية</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(totals).map(([currency, total]) => (
          <Card key={currency} className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <h3 className="text-gray-600 text-sm font-medium mb-2">{currency}</h3>
            <p className={`text-3xl font-bold ${total >= 0 ? "text-success" : "text-danger"}`}>
              {total.toFixed(2)}
            </p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-4">
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

      {/* Balances Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-right">الحساب</th>
                <th className="px-6 py-3 text-right">نوع الحساب</th>
                <th className="px-6 py-3 text-right">دولار</th>
                <th className="px-6 py-3 text-right">يورو</th>
                <th className="px-6 py-3 text-right">ليرة سورية</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredBalances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    لا توجد أرصدة
                  </td>
                </tr>
              ) : (
                filteredBalances.map((item, idx) => (
                  <tr key={item.account?.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 font-medium">{item.account?.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="badge-info">{item.account?.accountType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={parseFloat(item.currencies["دولار"] || "0") >= 0 ? "text-success" : "text-danger"}>
                        {(parseFloat(item.currencies["دولار"] || "0")).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={parseFloat(item.currencies["يورو"] || "0") >= 0 ? "text-success" : "text-danger"}>
                        {(parseFloat(item.currencies["يورو"] || "0")).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={parseFloat(item.currencies["ليرة سورية"] || "0") >= 0 ? "text-success" : "text-danger"}>
                        {(parseFloat(item.currencies["ليرة سورية"] || "0")).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
