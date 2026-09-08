"use client";

import { useEffect, useState } from "react";
import { Route, Ticket, Package, Bus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/summary")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your fleet&apos;s activity this month.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Trips this month" value={loading ? "—" : stats?.totalTrips ?? 0} icon={Route} />
        <StatsCard label="Bookings" value={loading ? "—" : stats?.totalBookings ?? 0} icon={Ticket} />
        <StatsCard label="Parcels" value={loading ? "—" : stats?.totalParcels ?? 0} icon={Package} />
        <StatsCard label="Active buses" value={loading ? "—" : stats?.activeBuses ?? 0} icon={Bus} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue this month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-slate-900">
            {loading ? "—" : formatCurrency(stats?.totalRevenue ?? 0)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Combined revenue from bookings and parcels.</p>
        </CardContent>
      </Card>
    </div>
  );
}
