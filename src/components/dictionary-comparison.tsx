
"use client";

import { useState, useMemo, ChangeEvent } from "react";
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
import { UploadCloud, Loader2, GitCompareArrows, AlertTriangle, Plus, Minus, Pencil, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { TableData } from "./dictionary-viewer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";

type ComparisonResult = {
  addedTables: TableData[];
  removedTables: TableData[];
  modifiedTables: {
    name: string;
    addedColumns: TableData['fields'];
    removedColumns: TableData['fields'];
    modifiedColumns: {
      old: TableData['fields'][0];
      new: TableData['fields'][0];
    }[];
  }[];
};

export function DictionaryComparison() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const handleFileChange = (fileType: 'A' | 'B') => (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type === "text/html") {
      if (fileType === 'A') setFileA(selectedFile);
      if (fileType === 'B') setFileB(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione um arquivo .html.",
      });
    }
  };
  
  const parseHtmlDictionary = (file: File): Promise<TableData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const decoder = new TextDecoder('utf-8');
          const content = decoder.decode(buffer);

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
                  if (headerText === 'Lista de campos') { isFieldsSection = true; isFkSection = false; return; }
                  if (headerText === 'Chaves Estrangeiras') { isFieldsSection = false; isFkSection = true; return; }
              }

              if (isFieldsSection && ths.length === 0 && tds.length === 4) {
                   fields.push({
                      name: tds[0].textContent?.trim() || '',
                      type: tds[1].textContent?.trim() || '',
                      size: tds[2].textContent?.trim().replace(/&nbsp;/g, '') || '',
                      description: tds[3].textContent?.trim() || '',
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
          resolve(parsedTables);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  const handleCompare = async () => {
    if (!fileA || !fileB) {
      toast({ variant: "destructive", title: "Faltam arquivos", description: "Por favor, selecione dois dicionários para comparar." });
      return;
    }
    setLoading(true);
    setComparisonResult(null);

    try {
      const [dictA, dictB] = await Promise.all([parseHtmlDictionary(fileA), parseHtmlDictionary(fileB)]);
      
      const tablesA = new Map(dictA.map(t => [t.name, t]));
      const tablesB = new Map(dictB.map(t => [t.name, t]));

      const addedTables: TableData[] = [];
      const removedTables: TableData[] = [];
      const modifiedTables: ComparisonResult['modifiedTables'] = [];

      for (const [name, tableA] of tablesA.entries()) {
        if (!tablesB.has(name)) {
          removedTables.push(tableA);
        }
      }

      for (const [name, tableB] of tablesB.entries()) {
        if (!tablesA.has(name)) {
          addedTables.push(tableB);
        } else {
          const tableA = tablesA.get(name)!;
          const fieldsA = new Map(tableA.fields.map(f => [f.name, f]));
          const fieldsB = new Map(tableB.fields.map(f => [f.name, f]));

          const addedColumns: TableData['fields'] = [];
          const removedColumns: TableData['fields'] = [];
          const modifiedColumns: { old: TableData['fields'][0]; new: TableData['fields'][0] }[] = [];

          for (const [fieldName, fieldA] of fieldsA.entries()) {
            if (!fieldsB.has(fieldName)) {
              removedColumns.push(fieldA);
            }
          }
          
          for (const [fieldName, fieldB] of fieldsB.entries()) {
            if (!fieldsA.has(fieldName)) {
              addedColumns.push(fieldB);
            } else {
              const fieldA = fieldsA.get(fieldName)!;
              if (fieldA.type !== fieldB.type || fieldA.size !== fieldB.size || fieldA.description !== fieldB.description) {
                modifiedColumns.push({ old: fieldA, new: fieldB });
              }
            }
          }
          
          if (addedColumns.length > 0 || removedColumns.length > 0 || modifiedColumns.length > 0) {
            modifiedTables.push({ name, addedColumns, removedColumns, modifiedColumns });
          }
        }
      }

      setComparisonResult({ addedTables, removedTables, modifiedTables });
      toast({ title: "Comparação Concluída", description: "Os resultados são exibidos abaixo." });
    } catch (error) {
      console.error("Erro ao comparar dicionários:", error);
      toast({ variant: "destructive", title: "Erro na Comparação", description: "Não foi possível comparar os arquivos." });
    } finally {
      setLoading(false);
    }
  };
  
  const hasChanges = useMemo(() => {
    if (!comparisonResult) return false;
    return comparisonResult.addedTables.length > 0 || comparisonResult.removedTables.length > 0 || comparisonResult.modifiedTables.length > 0;
  }, [comparisonResult]);


  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Comparador de Dicionário de Dados</CardTitle>
          <CardDescription>
            Faça o upload de duas versões de um dicionário de dados (.html) para ver as diferenças.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="file-a">Dicionário Antigo</Label>
              <Input id="file-a" type="file" onChange={handleFileChange('A')} accept=".html" />
              {fileA && <p className="text-sm text-muted-foreground">{fileA.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-b">Dicionário Novo</Label>
              <Input id="file-b" type="file" onChange={handleFileChange('B')} accept=".html" />
              {fileB && <p className="text-sm text-muted-foreground">{fileB.name}</p>}
            </div>
          </div>
          <Button onClick={handleCompare} disabled={loading || !fileA || !fileB} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitCompareArrows className="mr-2 h-4 w-4" />}
            Comparar Dicionários
          </Button>
        </CardContent>
      </Card>
      
      {comparisonResult && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resultados da Comparação</CardTitle>
          </CardHeader>
          <CardContent>
             {!hasChanges ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/50 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold">Nenhuma alteração encontrada</h3>
                    <p className="text-muted-foreground">Os dois dicionários de dados são idênticos.</p>
                </div>
            ) : (
                <Accordion type="multiple" className="w-full">
                {comparisonResult.addedTables.length > 0 && (
                    <AccordionItem value="added-tables">
                    <AccordionTrigger><div className="flex items-center gap-2"><Plus className="text-green-500"/> Tabelas Adicionadas ({comparisonResult.addedTables.length})</div></AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc pl-5 space-y-1">
                        {comparisonResult.addedTables.map(t => <li key={t.name}>{t.name}</li>)}
                        </ul>
                    </AccordionContent>
                    </AccordionItem>
                )}
                {comparisonResult.removedTables.length > 0 && (
                    <AccordionItem value="removed-tables">
                    <AccordionTrigger><div className="flex items-center gap-2"><Minus className="text-red-500"/> Tabelas Removidas ({comparisonResult.removedTables.length})</div></AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc pl-5 space-y-1">
                        {comparisonResult.removedTables.map(t => <li key={t.name}>{t.name}</li>)}
                        </ul>
                    </AccordionContent>
                    </AccordionItem>
                )}
                {comparisonResult.modifiedTables.length > 0 && (
                     <AccordionItem value="modified-tables">
                        <AccordionTrigger><div className="flex items-center gap-2"><Pencil className="text-blue-500"/> Tabelas Modificadas ({comparisonResult.modifiedTables.length})</div></AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            {comparisonResult.modifiedTables.map(t => (
                               <Card key={t.name}>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg">{t.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-2">
                                        {t.addedColumns.length > 0 && <div><h4 className="font-semibold flex items-center gap-2"><Plus size={16} className="text-green-500"/>Colunas Adicionadas:</h4><ul className="list-disc pl-10 text-sm">{t.addedColumns.map(c => <li key={c.name}>{c.name} ({c.type})</li>)}</ul></div>}
                                        {t.removedColumns.length > 0 && <div><h4 className="font-semibold flex items-center gap-2"><Minus size={16} className="text-red-500"/>Colunas Removidas:</h4><ul className="list-disc pl-10 text-sm">{t.removedColumns.map(c => <li key={c.name}>{c.name}</li>)}</ul></div>}
                                        {t.modifiedColumns.length > 0 && <div><h4 className="font-semibold flex items-center gap-2"><Pencil size={16} className="text-blue-500"/>Colunas Modificadas:</h4><ul className="list-disc pl-10 text-sm">{t.modifiedColumns.map(c => <li key={c.new.name}><b>{c.new.name}</b>: <Badge variant="secondary">{c.old.type} &rarr; {c.new.type}</Badge></li>)}</ul></div>}
                                    </CardContent>
                               </Card>
                            ))}
                        </AccordionContent>
                     </AccordionItem>
                )}
                </Accordion>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
