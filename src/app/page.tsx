import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, FileCheck2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 md:p-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Ferramentas
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground mx-auto">
          Selecione uma das ferramentas abaixo para começar.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/dictionary" className="group">
          <Card className="h-full hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">
                Dicionário de Dados
              </CardTitle>
              <BookText className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gerencie e consulte o dicionário de dados.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/validator" className="group">
          <Card className="h-full hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">
                Validador R2D2
              </CardTitle>
              <FileCheck2 className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Valide a estrutura de arquivos de importação (.txt ou .csv).
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
