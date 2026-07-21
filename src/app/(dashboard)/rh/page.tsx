import { Users } from "lucide-react";
import { RhTabs } from "./components/RhTabs";

export default function RhPage() {
  return (
    <div className="flex-1 flex flex-col space-y-4 p-8 pt-6 h-full min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
          <Users className="text-indigo-600 dark:text-indigo-400" />
          Módulo de RH e Gestão de Pessoas
        </h2>
      </div>
      
      <RhTabs />
    </div>
  );
}
