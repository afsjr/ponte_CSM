import { BookOpen } from "lucide-react";
import { PedagogicoTabs } from "./components/PedagogicoTabs";

export default function PedagogicoPage() {
  return (
    <div className="flex-1 flex flex-col space-y-4 p-8 pt-6 h-full min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
          <BookOpen className="text-blue-600 dark:text-blue-400" />
          Módulo Pedagógico
        </h2>
      </div>
      
      <PedagogicoTabs />
    </div>
  );
}
