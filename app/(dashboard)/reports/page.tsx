"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface MonthlyRevenue {
  month: string;
  amount: number;
}

export default function ReportsPage() {
  const [months, setMonths] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/revenue")
      .then((res) => res.json())
      .then((data) => setMonths(data.months ?? []))
      .finally(() => setLoading(false));
  }, []);

  const maxAmount = Math.max(1, ...months.map((m) => m.amount));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Revenue and performance trends over the last 6 months.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <div className="flex items-end gap-4">
              {months.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-primary-500"
                    style={{ height: `${Math.max((item.amount / maxAmount) * 160, 4)}px` }}
                    title={formatCurrency(item.amount)}
                  />
                  <span className="text-xs font-medium text-slate-500">{item.month}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
