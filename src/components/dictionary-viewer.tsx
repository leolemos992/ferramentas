"use client";

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

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

  return (
    <div className="flex h-[calc(100vh-12rem)] border rounded-lg">
      <aside className="w-1/4 min-w-[250px] border-r">
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Tabelas ({filteredTables.length})</h3>
          <Input
            placeholder="Filtrar tabelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[calc(100%-8rem)]">
          <div className="px-4 space-y-1">
            {filteredTables.map((table) => (
              <Button
                key={table.name}
                variant="ghost"
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "w-full justify-start text-left h-auto py-2",
                  selectedTable?.name === table.name && "bg-muted hover:bg-muted"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{table.name}</span>
                  <span className="text-xs text-muted-foreground">{table.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>
      <main className="w-3/4 p-4 md:p-6">
        <ScrollArea className="h-full">
            {selectedTable ? (
                <div className="space-y-6">
                    <header>
                        <h2 className="text-2xl font-bold">{selectedTable.name}</h2>
                        <p className="text-muted-foreground">{selectedTable.description}</p>
                    </header>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">Campos</h3>
                            <Input
                                placeholder="Filtrar colunas..."
                                value={columnSearchTerm}
                                onChange={(e) => setColumnSearchTerm(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Tamanho</TableHead>
                                <TableHead>Descrição</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {filteredFields.map((field, fieldIndex) => (
                                <TableRow key={fieldIndex}>
                                <TableCell className="font-mono text-xs">{field.name}</TableCell>
                                <TableCell className="font-mono text-xs">{field.type}</TableCell>
                                <TableCell className="font-mono text-xs">{field.size}</TableCell>
                                <TableCell>{field.description}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                         {filteredFields.length === 0 && <p className='text-center text-muted-foreground pt-4'>Nenhuma coluna encontrada.</p>}
                    </div>

                    {selectedTable.foreignKeys.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg pt-4">Chaves Estrangeiras</h3>
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
                                    <TableCell className="font-mono text-xs">{fk.relatedTable}</TableCell>
                                    <TableCell className="font-mono text-xs">{fk.relatedColumn}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
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