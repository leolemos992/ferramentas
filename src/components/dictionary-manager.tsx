
"use client";

import { useState, useMemo, useRef, ChangeEvent } from "react";
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
import { UploadCloud, X, Loader2, Search, Library, Columns, FileType, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { DictionaryViewer, TableData } from "./dictionary-viewer";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";

type SearchType = "all" | "table" | "column" | "type";

export function DictionaryManager() {
  const [file, setFile] = useState<File | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [exactMatch, setExactMatch] = useState(false);
  const [filteredTables, setFilteredTables] = useState<TableData[]>([]);

  const stats = useMemo(() => {
    const totalTables = tables.length;
    const totalColumns = tables.reduce((acc, table) => acc + table.fields.length, 0);
    const totalFks = tables.reduce((acc, table) => acc + table.foreignKeys.length, 0);
    return { totalTables, totalColumns, totalFks };
  }, [tables]);

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
    setFilteredTables([]);
    setGlobalSearchTerm("");
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
        setFilteredTables(parsedTables);
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

    reader.readAsText(fileToParse, "latin1");
  };

  const handleGlobalSearch = () => {
    if (!globalSearchTerm) {
      setFilteredTables(tables);
      return;
    }

    const term = globalSearchTerm.toLowerCase();
    
    const results = tables.map(table => {
      const newTable = { ...table, fields: [...table.fields] };
      
      const matchName = exactMatch ? table.name.toLowerCase() === term : table.name.toLowerCase().includes(term);
      const matchDesc = exactMatch ? table.description.toLowerCase() === term : table.description.toLowerCase().includes(term);

      let tableMatches = searchType === 'all' || searchType === 'table' ? matchName || matchDesc : false;

      const matchingFields = table.fields.filter(field => {
        if (searchType === 'column') {
          return exactMatch ? field.name.toLowerCase() === term : field.name.toLowerCase().includes(term);
        }
        if (searchType === 'type') {
          return exactMatch ? field.type.toLowerCase() === term : field.type.toLowerCase().includes(term);
        }
        if (searchType === 'all') {
          return (exactMatch ? field.name.toLowerCase() === term : field.name.toLowerCase().includes(term)) || 
                 (exactMatch ? field.type.toLowerCase() === term : field.type.toLowerCase().includes(term));
        }
        return false;
      });

      if (matchingFields.length > 0) {
        newTable.fields = matchingFields;
        tableMatches = true;
      }
      
      return tableMatches ? newTable : null;
    }).filter((t): t is TableData => t !== null);

    setFilteredTables(results);
  };

  const clearFilters = () => {
    setGlobalSearchTerm("");
    setFilteredTables(tables);
    setSearchType("all");
    setExactMatch(false);
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  if (!file && !loading) {
    return (
       <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
         <Card className="w-full max-w-lg text-center shadow-lg animate-in fade-in-50 duration-500">
           <CardHeader>
             <CardTitle className="text-2xl font-bold tracking-tight">Analisador de Dicionário de Dados</CardTitle>
             <CardDescription>
               Faça o upload de um arquivo HTML para visualizar e pesquisar no dicionário de dados.
             </CardDescription>
           </CardHeader>
           <CardContent>
            <Label
              htmlFor="file-upload"
              className={cn(
                "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors",
                {"pointer-events-none opacity-50": loading}
              )}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      Clique para fazer upload
                    </span>{" "}
                    ou arraste e solte
                  </p>
                  <p className="text-xs text-muted-foreground">Arquivo .HTML</p>
                </div>
            </Label>
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".html"
              className="sr-only"
            />
           </CardContent>
         </Card>
       </div>
     );
  }

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analisador de Dicionário de Dados</h1>
        <Button variant="outline" onClick={handleUploadClick}>
            <UploadCloud className="mr-2"/>
            Carregar Novo Arquivo
        </Button>
      </header>

        {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
                <p className="text-lg text-muted-foreground">Processando arquivo...</p>
            </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Tabelas</CardTitle>
                  <Library className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTables}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Colunas</CardTitle>
                  <Columns className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalColumns}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chaves Estrangeiras</CardTitle>
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFks}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-8">
              <CardContent className="p-4 space-y-4">
                <div className="flex gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar em todas as tabelas, colunas, tipos..."
                            className="pl-10"
                            value={globalSearchTerm}
                            onChange={(e) => setGlobalSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                        />
                    </div>
                    <Button onClick={handleGlobalSearch}>
                        <Search className="mr-2"/>
                        Buscar
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <RadioGroup defaultValue="all" className="flex items-center gap-4" value={searchType} onValueChange={(v: SearchType) => setSearchType(v)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="r-all" />
                            <Label htmlFor="r-all">Tudo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="table" id="r-table" />
                            <Label htmlFor="r-table">Nomes de Tabela</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="column" id="r-column" />
                            <Label htmlFor="r-column">Nomes de Coluna</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="type" id="r-type" />
                            <Label htmlFor="r-type">Tipos de Dados</Label>
                        </div>
                    </RadioGroup>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="exact-match" checked={exactMatch} onCheckedChange={(c) => setExactMatch(c as boolean)} />
                        <Label htmlFor="exact-match">Busca Exata</Label>
                    </div>
                    <Button variant="ghost" onClick={clearFilters}>
                        <X className="mr-2"/> Limpar Filtros
                    </Button>
                </div>
              </CardContent>
            </Card>

            <DictionaryViewer tables={filteredTables} />
          </>
        )}
    </div>
  );
}
