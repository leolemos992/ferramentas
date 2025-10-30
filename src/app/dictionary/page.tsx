
import { DictionaryManager } from "@/components/dictionary-manager";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DictionaryPage() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-start relative bg-muted/40">
      <DictionaryManager />
      <Toaster />
    </main>
  );
}
