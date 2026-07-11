import { Suspense } from "react";
import LaporanClient from "./LaporanClient";

export const dynamic = "force-dynamic";

export default function LaporanPage() {
  return (
    <Suspense fallback={<LaporanSkeleton />}>
      <LaporanClient />
    </Suspense>
  );
}

function LaporanSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 bg-surface-card rounded-md" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-surface-card rounded-md" />
        ))}
      </div>
      <div className="h-80 bg-surface-card rounded-md" />
    </div>
  );
}
