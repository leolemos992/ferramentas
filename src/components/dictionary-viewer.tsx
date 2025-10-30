"use client";

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge';

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

  const filteredTables = useMemo(() => {
    if (!searchTerm) return tables;
    return tables.filter(table =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tables, searchTerm]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Pesquisar tabelas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Accordion type="single" collapsible className="w-full">
        {filteredTables.map((table, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger>
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">{table.name}</span>
                    <Badge variant="outline">{table.description}</Badge>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 p-2">
                    <h3 className="font-semibold text-md">Campos</h3>
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
                        {table.fields.map((field, fieldIndex) => (
                            <TableRow key={fieldIndex}>
                            <TableCell className="font-mono text-xs">{field.name}</TableCell>
                            <TableCell className="font-mono text-xs">{field.type}</TableCell>
                            <TableCell className="font-mono text-xs">{field.size}</TableCell>
                            <TableCell>{field.description}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>

                    {table.foreignKeys.length > 0 && (
                        <>
                            <h3 className="font-semibold text-md pt-4">Chaves Estrangeiras</h3>
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
                                {table.foreignKeys.map((fk, fkIndex) => (
                                    <TableRow key={fkIndex}>
                                    <TableCell className="font-mono text-xs">{fk.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{fk.column}</TableCell>
                                    <TableCell className="font-mono text-xs">{fk.relatedTable}</TableCell>
                                    <TableCell className="font-mono text-xs">{fk.relatedColumn}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </>
                    )}
                </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {filteredTables.length === 0 && <p className='text-center text-muted-foreground pt-8'>Nenhuma tabela encontrada.</p>}
    </div>
  );
}
