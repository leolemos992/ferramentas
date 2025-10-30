
"use client";

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export type TableData = {
  name: string;
  description: string;
  fields: {
    name: string;
    type: string;
    size: string;
    description: string;
  }[];
  foreignKeys: {
    name: string;
    column: string;
    relatedTable: string;
    relatedColumn: string;
  }[];
};

type DictionaryViewerProps = {
  tables: TableData[];
};

export function DictionaryViewer({ tables }: DictionaryViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState<TableData | null>(tables[0] || null);
  const [columnSearchTerm, setColumnSearchTerm] = useState("");

  const filteredTables = useMemo(() => {
    if (!searchTerm) return tables;
    return tables.filter(table =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tables, searchTerm]);

  const filteredFields = useMemo(() => {
    if (!selectedTable) return [];
    if (!columnSearchTerm) return selectedTable.fields;
    return selectedTable.fields.filter(field =>
      field.name.toLowerCase().includes(columnSearchTerm.toLowerCase()) ||
      field.description.toLowerCase().includes(columnSearchTerm.toLowerCase())
    );
  }, [selectedTable, columnSearchTerm]);

  const handleSelectTable = (tableName: string) => {
    const tableToSelect = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
    if (tableToSelect) {
      setSelectedTable(tableToSelect);
    }
  };

  return (
    <div className="flex h-[calc(100vh-22rem)] border rounded-lg bg-card text-card-foreground">
      <aside className="w-1/4 min-w-[250px] border-r flex flex-col">
        <div className="p-4 space-y-4 border-b">
          <h3 className="text-lg font-semibold tracking-tight">Tabelas ({filteredTables.length})</h3>
          <Input
            placeholder="Filtrar tabelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredTables.map((table) => (
              <Button
                key={table.name}
                variant="ghost"
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "w-full justify-start text-left h-auto py-2 px-3",
                  selectedTable?.name === table.name && "bg-muted hover:bg-muted"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{table.name}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{table.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>
      <main className="w-3/4 p-4 md:p-6">
        <ScrollArea className="h-full pr-4">
            {selectedTable ? (
                <div className="space-y-6">
                    <header>
                        <h2 className="text-2xl font-bold">{selectedTable.name}</h2>
                        <p className="text-muted-foreground">{selectedTable.description}</p>
                    </header>
                    
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Campos</CardTitle>
                                <Input
                                    placeholder="Filtrar colunas..."
                                    value={columnSearchTerm}
                                    onChange={(e) => setColumnSearchTerm(e.target.value)}
                                    className="max-w-xs"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Nome</TableHead>
                                    <TableHead className="w-[150px]">Tipo</TableHead>
                                    <TableHead className="w-[100px]">Tamanho</TableHead>
                                    <TableHead>Descrição</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {filteredFields.map((field, fieldIndex) => (
                                    <TableRow key={fieldIndex}>
                                        <TableCell className="font-mono text-xs">{field.name}</TableCell>
                                        <TableCell><Badge variant="secondary">{field.type}</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">{field.size}</TableCell>
                                        <TableCell>{field.description}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                             {filteredFields.length === 0 && <p className='text-center text-muted-foreground pt-8'>Nenhuma coluna encontrada.</p>}
                        </CardContent>
                    </Card>

                    {selectedTable.foreignKeys.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Chaves Estrangeiras</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Coluna</TableHead>
                                        <TableHead>Tabela Relacionada</TableHead>
                                        <TableHead>Coluna Relacionada</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {selectedTable.foreignKeys.map((fk, fkIndex) => (
                                        <TableRow key={fkIndex}>
                                        <TableCell className="font-mono text-xs">{fk.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{fk.column}</TableCell>
                                        <TableCell>
                                            <Button variant="link" className="p-0 h-auto font-mono text-xs" onClick={() => handleSelectTable(fk.relatedTable)}>
                                                {fk.relatedTable}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{fk.relatedColumn}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Selecione uma tabela para ver os detalhes.</p>
                </div>
            )}
        </ScrollArea>
      </main>
    </div>
  );
}
