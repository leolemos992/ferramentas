"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { KeyRound, LogIn } from "lucide-react";

async function generateDailyPassword(seed: string): Promise<string> {
  const date = new Date();
  const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  const dataToHash = seed + dateString;

  const encoder = new TextEncoder();
  const data = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex.substring(0, 8);
}


export default function AuthPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const secretSeed = process.env.NEXT_PUBLIC_COMPARATOR_SECRET_SEED;

    if (!secretSeed) {
      toast({
        variant: "destructive",
        title: "Erro de Configuração",
        description: "O segredo de acesso não foi configurado corretamente.",
      });
      setLoading(false);
      return;
    }

    const correctPassword = await generateDailyPassword(secretSeed);

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
              <Label htmlFor="password">Senha</Label>
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
