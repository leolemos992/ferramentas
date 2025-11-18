"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DictionaryComparison } from "@/components/dictionary-comparison";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const AUTH_TIMEOUT = 15 * 60 * 1000; // 15 minutos em milissegundos

export default function DictionaryComparisonPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    try {
      const authorized = sessionStorage.getItem("isAuthorized") === "true";
      const authTimestamp = sessionStorage.getItem("authTimestamp");
      
      if (!authorized || !authTimestamp) {
        router.replace("/auth");
        return;
      }
      
      const lastAuthTime = parseInt(authTimestamp, 10);
      const now = new Date().getTime();

      if (now - lastAuthTime > AUTH_TIMEOUT) {
        sessionStorage.removeItem("isAuthorized");
        sessionStorage.removeItem("authTimestamp");
        router.replace("/auth");
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
       router.replace("/auth");
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verificando autorização...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-start bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-screen-2xl mx-auto">
        <Link href="/" className="mb-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
        <DictionaryComparison />
      </div>
      <Toaster />
    </main>
  );
}
