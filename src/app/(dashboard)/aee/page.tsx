import { Brain } from "lucide-react";
import AeeDashboard from "./components/AeeDashboard";

export default function AeePage() {
  return (
    <div className="flex-1 flex flex-col space-y-4 p-8 pt-6 h-full min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="text-[var(--color-csm-green)]" />
          Atendimento Educacional Especializado (AEE)
        </h2>
      </div>
      
      <AeeDashboard />
    </div>
  );
}
