import { Inbox } from "lucide-react";

export default function EmptyState({ message = "Belum ada data", icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-ash">
      <Icon className="h-10 w-10 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
