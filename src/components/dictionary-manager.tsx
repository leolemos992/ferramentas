"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookText } from "lucide-react";

export function DictionaryManager() {
  return (
    <Card className="w-full max-w-2xl shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <div className="flex items-center gap-4">
            <BookText className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight">
                Gerenciador de Dicionário de Dados
            </CardTitle>
        </div>
        <CardDescription>
          Em breve, você poderá gerenciar seu dicionário de dados aqui.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
}
