import { DollarSign } from "lucide-react";
import { FinanceiroTabs } from "./components/FinanceiroTabs";

export default function FinanceiroPage() {
  return (
    <div className="flex-1 flex flex-col space-y-4 p-8 pt-6 h-full min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
          <DollarSign className="text-emerald-600 dark:text-emerald-400" />
          Módulo Financeiro
        </h2>
      </div>
      
      <FinanceiroTabs />
    </div>
  );
}
