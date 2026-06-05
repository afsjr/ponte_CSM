import { Calendar } from "lucide-react";
import { SecretariaTabs } from "./components/SecretariaTabs";

export default function SecretariaPage() {
  return (
    <div className="flex-1 flex flex-col space-y-4 p-8 pt-6 h-full min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="text-blue-600" />
          Módulo da Secretaria
        </h2>
      </div>
      
      <SecretariaTabs />
    </div>
  );
}
