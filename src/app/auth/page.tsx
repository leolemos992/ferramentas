"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { KeyRound, LogIn } from "lucide-react";

function generateDailyPassword(): string {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1; // Month is 0-indexed
  const year = date.getFullYear() % 100; // Get last two digits of the year
  
  const password = day * month * year * 3;
  
  return password.toString();
}


export default function AuthPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const correctPassword = generateDailyPassword();

    if (password === correctPassword) {
      try {
        sessionStorage.setItem("isAuthorized", "true");
        router.push("/dictionary-comparison");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro de Navegador",
          description: "Não foi possível usar o Session Storage. Tente um navegador diferente.",
        });
        setLoading(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "A senha está incorreta.",
      });
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <KeyRound className="h-6 w-6" />
            Acesso Restrito
          </CardTitle>
          <CardDescription>
            Digite a senha diária para acessar o Comparador de Dicionários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha Técnica Diária</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
