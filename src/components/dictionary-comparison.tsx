
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
import { UploadCloud, Loader2, GitCompareArrows, CheckCircle, Plus, Minus, FileDiff, ArrowRight, CaseSensitive, Filter, X } from "lucide-react";
import { Label } from "./ui/label";
import { TableData } from "./dictionary-viewer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";


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

type FilterOptions = {
  showAdded: boolean;
  showRemoved: boolean;
  showModified: boolean;
  tableName: string;
}

export function DictionaryComparison() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    showAdded: true,
    showRemoved: true,
    showModified: true,
    tableName: '',
  });

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
  
  const filteredResults = useMemo(() => {
    if (!comparisonResult) return null;
    const term = filters.tableName.toLowerCase();
    
    const filterByName = (item: { name: string }) => item.name.toLowerCase().includes(term);

    return {
      addedTables: filters.showAdded ? comparisonResult.addedTables.filter(filterByName) : [],
      removedTables: filters.showRemoved ? comparisonResult.removedTables.filter(filterByName) : [],
      modifiedTables: filters.showModified ? comparisonResult.modifiedTables.filter(filterByName) : [],
    };
  }, [comparisonResult, filters]);


  const hasChanges = useMemo(() => {
    if (!comparisonResult) return false;
    return comparisonResult.addedTables.length > 0 || comparisonResult.removedTables.length > 0 || comparisonResult.modifiedTables.length > 0;
  }, [comparisonResult]);


  const renderModifiedColumnDetail = (oldCol: TableData['fields'][0], newCol: TableData['fields'][0]) => {
    const changes: React.ReactNode[] = [];
    if (oldCol.type !== newCol.type) {
      changes.push(
        <div key={`type-${newCol.name}`} className="flex items-center gap-2">
          <CaseSensitive className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Tipo:</span>
          <Badge variant="outline">{oldCol.type}</Badge>
          <ArrowRight className="h-4 w-4" />
          <Badge variant="secondary">{newCol.type}</Badge>
        </div>
      );
    }
    if (oldCol.size !== newCol.size) {
      changes.push(
        <div key={`size-${newCol.name}`} className="flex items-center gap-2">
          <CaseSensitive className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Tamanho:</span>
          <Badge variant="outline">{oldCol.size || 'N/A'}</Badge>
          <ArrowRight className="h-4 w-4" />
          <Badge variant="secondary">{newCol.size || 'N/A'}</Badge>
        </div>
      );
    }
    if (oldCol.description !== newCol.description) {
        changes.push(
          <div key={`description-${newCol.name}`} className="flex items-start gap-2">
            <CaseSensitive className="h-4 w-4 text-muted-foreground mt-1" />
            <div className="flex flex-col">
              <span className="font-semibold">Descrição:</span>
              <p className="text-xs text-red-600 line-through">DE: {oldCol.description}</p>
              <p className="text-xs text-green-600">PARA: {newCol.description}</p>
            </div>
          </div>
        );
      }
    return <div className="space-y-1">{changes}</div>;
  };


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
              <Label htmlFor="file-a">Dicionário Antigo (Versão A)</Label>
              <Input id="file-a" type="file" onChange={handleFileChange('A')} accept=".html" />
              {fileA && <p className="text-sm text-muted-foreground">{fileA.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-b">Dicionário Novo (Versão B)</Label>
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
            <CardDescription>Resumo das alterações entre a Versão A e a Versão B.</CardDescription>
          </CardHeader>
          <CardContent>
             {!hasChanges ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Nenhuma alteração encontrada</h3>
                    <p className="text-muted-foreground">Os dois dicionários de dados são idênticos.</p>
                </div>
            ) : (
                <>
                <Card className="mb-6 bg-muted/30">
                    <CardHeader className="p-4 flex flex-row items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5"/>
                            <h3 className="text-lg font-semibold">Filtros</h3>
                         </div>
                        <Button variant="ghost" size="sm" onClick={() => setFilters({ showAdded: true, showRemoved: true, showModified: true, tableName: '' })}>
                            <X className="mr-2 h-4 w-4"/>
                            Limpar Filtros
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                        <Input
                            placeholder="Filtrar por nome de tabela..."
                            value={filters.tableName}
                            onChange={(e) => setFilters(prev => ({ ...prev, tableName: e.target.value }))}
                        />
                         <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="showAdded" checked={filters.showAdded} onCheckedChange={(checked) => setFilters(prev => ({...prev, showAdded: checked as boolean}))} />
                                <Label htmlFor="showAdded" className="text-green-700 font-medium">Adicionadas</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="showRemoved" checked={filters.showRemoved} onCheckedChange={(checked) => setFilters(prev => ({...prev, showRemoved: checked as boolean}))}/>
                                <Label htmlFor="showRemoved" className="text-red-700 font-medium">Removidas</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="showModified" checked={filters.showModified} onCheckedChange={(checked) => setFilters(prev => ({...prev, showModified: checked as boolean}))}/>
                                <Label htmlFor="showModified" className="text-blue-700 font-medium">Modificadas</Label>
                            </div>
                         </div>
                    </CardContent>
                </Card>

                {filteredResults && (
                    <Accordion type="multiple" defaultValue={["added-tables", "removed-tables", "modified-tables"]} className="w-full">
                    {filteredResults.addedTables.length > 0 && (
                        <AccordionItem value="added-tables">
                        <AccordionTrigger><div className="flex items-center gap-2 font-semibold"><Plus className="text-green-500"/> Tabelas Adicionadas ({filteredResults.addedTables.length})</div></AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                                {filteredResults.addedTables.map(t => <Badge key={t.name} variant="outline" className="text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-700 dark:bg-green-900/30">{t.name}</Badge>)}
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    )}
                    {filteredResults.removedTables.length > 0 && (
                        <AccordionItem value="removed-tables">
                        <AccordionTrigger><div className="flex items-center gap-2 font-semibold"><Minus className="text-red-500"/> Tabelas Removidas ({filteredResults.removedTables.length})</div></AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                                {filteredResults.removedTables.map(t => <Badge key={t.name} variant="outline" className="text-red-700 border-red-200 bg-red-50 dark:text-red-300 dark:border-red-700 dark:bg-red-900/30">{t.name}</Badge>)}
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    )}
                    {filteredResults.modifiedTables.length > 0 && (
                        <AccordionItem value="modified-tables">
                            <AccordionTrigger><div className="flex items-center gap-2 font-semibold"><FileDiff className="text-blue-500"/> Tabelas Modificadas ({filteredResults.modifiedTables.length})</div></AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                {filteredResults.modifiedTables.map(t => (
                                <Card key={t.name} className="bg-secondary/30">
                                        <CardHeader className="p-4 bg-secondary/50 rounded-t-lg">
                                            <CardTitle className="text-lg font-mono">{t.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10"></TableHead>
                                                <TableHead>Coluna</TableHead>
                                                <TableHead>Detalhes da Alteração</TableHead>
                                            </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {t.addedColumns.map(c => (
                                                    <TableRow key={`add-${c.name}`} className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30">
                                                        <TableCell><Plus className="h-4 w-4 text-green-600"/></TableCell>
                                                        <TableCell className="font-mono text-xs">{c.name}</TableCell>
                                                        <TableCell className="text-xs">
                                                            Tipo: <Badge variant="secondary">{c.type}</Badge>, Tamanho: <Badge variant="secondary">{c.size || 'N/A'}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {t.removedColumns.map(c => (
                                                    <TableRow key={`rem-${c.name}`} className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30">
                                                        <TableCell><Minus className="h-4 w-4 text-red-600"/></TableCell>
                                                        <TableCell className="font-mono text-xs">{c.name}</TableCell>
                                                        <TableCell className="text-xs text-red-700 dark:text-red-300">Coluna removida</TableCell>
                                                    </TableRow>
                                                ))}
                                                {t.modifiedColumns.map(c => (
                                                    <TableRow key={`mod-${c.new.name}`} className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                                        <TableCell><FileDiff className="h-4 w-4 text-blue-600"/></TableCell>
                                                        <TableCell className="font-mono text-xs">{c.new.name}</TableCell>
                                                        <TableCell className="text-xs">
                                                        {renderModifiedColumnDetail(c.old, c.new)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        </CardContent>
                                </Card>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    )}
                    </Accordion>
                )}
                </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
