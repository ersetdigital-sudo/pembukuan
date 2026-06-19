import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 bg-surface-2 rounded-card" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-surface-2 rounded-card" />
        ))}
      </div>
      <div className="h-80 bg-surface-2 rounded-card" />
    </div>
  );
}
