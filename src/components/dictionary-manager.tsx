
"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { DictionaryViewer, TableData } from "./dictionary-viewer";

export function DictionaryManager() {
  const [file, setFile] = useState<File | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type === "text/html") {
      setFile(selectedFile);
      setTables([]);
      handleParseFile(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione um arquivo .html.",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
      setTables([]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTables([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleParseFile = (fileToParse: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const tableElements = doc.querySelectorAll("body > center > div > table");

        const parsedTables: TableData[] = Array.from(tableElements).map((table) => {
          const rows = Array.from(table.querySelectorAll("tr"));
          const tableName = rows[0]?.querySelectorAll("td")[0]?.textContent?.trim() || "";
          const tableDesc = rows[1]?.querySelectorAll("td")[0]?.textContent?.trim() || "";
          
          let isFieldsSection = false;
          let isFkSection = false;

          const fields: TableData['fields'] = [];
          const foreignKeys: TableData['foreignKeys'] = [];

          rows.forEach(row => {
            const ths = row.querySelectorAll('th');
            const tds = row.querySelectorAll('td');

            if (ths.length > 0) {
                const headerText = ths[0].textContent?.trim();
                if (headerText === 'Lista de campos') {
                    isFieldsSection = true;
                    isFkSection = false;
                    return;
                }
                if (headerText === 'Chaves Estrangeiras') {
                    isFieldsSection = false;
                    isFkSection = true;
                    return;
                }
            }

            if (isFieldsSection && ths.length === 0 && tds.length === 4) {
                 fields.push({
                    name: tds[0].textContent?.trim().replace(/\s/g, ' ') || '',
                    type: tds[1].textContent?.trim().replace(/\s/g, ' ') || '',
                    size: tds[2].textContent?.trim().replace(/&nbsp;/g, '') || '',
                    description: tds[3].textContent?.trim().replace(/\s/g, ' ') || '',
                });
            } else if (isFkSection && ths.length === 0 && tds.length === 4) {
                foreignKeys.push({
                    name: tds[0].textContent?.trim() || '',
                    column: tds[1].textContent?.trim() || '',
                    relatedTable: tds[2].textContent?.trim() || '',
                    relatedColumn: tds[3].textContent?.trim() || '',
                });
            }
          });

          return { name: tableName, description: tableDesc, fields, foreignKeys };
        });
        
        setTables(parsedTables);
        toast({
            title: "Dicionário carregado",
            description: `${parsedTables.length} tabelas foram carregadas com sucesso.`,
          });

      } catch (error) {
        console.error("Error parsing HTML file:", error);
        toast({
          variant: "destructive",
          title: "Erro ao processar arquivo",
          description: "Não foi possível ler o conteúdo do arquivo HTML.",
        });
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erro de leitura",
        description: "Houve um erro ao tentar ler o arquivo.",
      });
    }

    reader.readAsText(fileToParse);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full shadow-lg animate-in fade-in-50 duration-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Gerenciador de Dicionário de Dados
          </CardTitle>
          <CardDescription>
            Faça o upload de um arquivo HTML para visualizar e pesquisar no
            dicionário de dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="file-upload"
              className={cn(
                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors",
                {"pointer-events-none opacity-50": loading}
              )}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 mb-3 text-muted-foreground animate-spin" />
                    <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      Clique para fazer upload
                    </span>{" "}
                    ou arraste e solte
                  </p>
                  <p className="text-xs text-muted-foreground">Arquivo .HTML</p>
                </div>
              )}
            </Label>
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".html"
              className="sr-only"
              disabled={loading}
            />
          </div>

          {file && !loading && (
            <div className="flex items-center justify-between p-3 bg-secondary rounded-md animate-in fade-in-50">
              <span className="text-sm font-medium text-secondary-foreground truncate">
                {file.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                aria-label="Remover arquivo"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {tables.length > 0 && !loading && (
        <div className="mt-8 animate-in fade-in-50 duration-500">
            <DictionaryViewer tables={tables} />
        </div>
      )}
    </div>
  );
}
