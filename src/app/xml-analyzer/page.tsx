import { XmlAnalyzer } from "@/components/xml-analyzer";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function XmlAnalyzerPage() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-start bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-screen-2xl mx-auto">
        <Link href="/" className="mb-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
        <XmlAnalyzer />
      </div>
      <Toaster />
    </main>
  );
}
