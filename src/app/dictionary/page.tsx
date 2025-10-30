import { DictionaryManager } from "@/components/dictionary-manager";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DictionaryPage() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-start p-4 sm:p-8 md:p-12 relative">
       <Link href="/" className="absolute top-4 left-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
      <DictionaryManager />
      <Toaster />
    </main>
  );
}
