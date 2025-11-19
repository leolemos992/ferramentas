
"use client";

import React, { useState, useRef, type ChangeEvent, useMemo } from "react";
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
import { X, CheckCircle, AlertCircle, UploadCloud, FileCheck, Trash2, Loader2, Wrench, Download, FileText, Edit, Save, List, Group, HelpCircle } from "lucide-react";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "./ui/dialog";


type FieldRule = {
  name: string;
  type: 'C' | 'N' | 'D' | 'T';
  maxLength: number;
  required: boolean;
  decimals?: number;
};

type ValidationRule = {
  fieldCount: number;
  fields: FieldRule[];
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

// Based on the documentation provided
const validationRules: ValidationRules = {
  OP: {
    fieldCount: 34,
    fields: [
      { name: "Identificação", type: "C", maxLength: 2, required: true },
      { name: "Filial", type: "C", maxLength: 4, required: true },
      { name: "Data", type: "D", maxLength: 8, required: true },
      { name: "Operador", type: "C", maxLength: 10, required: true },
      { name: "Ecf", type: "N", maxLength: 3, required: true },
      { name: "COO", type: "N", maxLength: 6, required: true },
      { name: "CCFGNF", type: "N", maxLength: 6, required: true },
      { name: "Hora inicial", type: "T", maxLength: 14, required: true },
      { name: "Hora final", type: "T", maxLength: 14, required: true },
      { name: "Tipo", type: "N", maxLength: 2, required: true },
      { name: "Histórico", type: "C", maxLength: 60, required: false },
      { name: "Cancelado", type: "N", maxLength: 1, required: true },
      { name: "Supervisor cancelamento", type: "C", maxLength: 10, required: false },
      { name: "Hora cancelamento", type: "T", maxLength: 14, required: false },
      { name: "Valor bruto da operação", type: "N", maxLength: 12, decimals: 2, required: true },
      { name: "Valor arredondamento da operação", type: "N", maxLength: 12, decimals: 2, required: false },
      { name: "Valor desconto subtotal", type: "N", maxLength: 12, decimals: 2, required: false },
      { name: "Valor líquido", type: "N", maxLength: 12, decimals: 2, required: true },
      { name: "Motivo do desconto subtotal", type: "C", maxLength: 5, required: false },
      { name: "Supervisor desconto subtotal", type: "C", maxLength: 10, required: false },
      { name: "Ordem da venda manual", type: "C", maxLength: 6, required: false },
      { name: "Série da venda manual", type: "C", maxLength: 6, required: false },
      { name: "Subsérie da venda manual", type: "C", maxLength: 6, required: false },
      { name: "ECF Série", type: "C", maxLength: 20, required: false },
      { name: "ECF Letra adicional", type: "C", maxLength: 1, required: false },
      { name: "ECF Modelo", type: "C", maxLength: 20, required: false },
      { name: "ECF Proprietário", type: "N", maxLength: 1, required: false },
      { name: "ECF Marca", type: "C", maxLength: 20, required: false },
      { name: "IP", type: "C", maxLength: 20, required: false },
      { name: "Cartão fidelidade", type: "C", maxLength: 20, required: false },
      { name: "Cartão fidelidade lido", type: "N", maxLength: 1, required: false },
      { name: "Cliente", type: "C", maxLength: 14, required: false },
      { name: "CPFCNPJ consumidor", type: "C", maxLength: 18, required: false },
      { name: "Nome consumidor", type: "C", maxLength: 40, required: false },
    ],
  },
  IT: {
    fieldCount: 22,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Sequência", type: "N", maxLength: 6, required: true },
        { name: "Produto", type: "C", maxLength: 20, required: true },
        { name: "Código de barras lido", type: "C", maxLength: 20, required: false },
        { name: "Quantidade", type: "N", maxLength: 12, decimals: 3, required: true },
        { name: "UN", type: "C", maxLength: 3, required: true },
        { name: "Preço unitário", type: "N", maxLength: 12, decimals: 3, required: true },
        { name: "Valor do desconto", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Valor do arredondamento", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Valor líquido", type: "N", maxLength: 12, decimals: 2, required: true },
        { name: "Vendedor", type: "C", maxLength: 10, required: false },
        { name: "Cancelado", type: "N", maxLength: 1, required: true },
        { name: "Número de série", type: "C", maxLength: 20, required: false },
        { name: "Tributação", type: "C", maxLength: 5, required: false },
        { name: "Motivo do desconto item", type: "C", maxLength: 5, required: false },
        { name: "Supervisor desconto item", type: "C", maxLength: 10, required: false },
        { name: "Item digitado", type: "N", maxLength: 1, required: false },
        { name: "DAV", type: "C", maxLength: 20, required: false },
        { name: "Grade", type: "C", maxLength: 256, required: false },
        { name: "Descrição do produto", type: "C", maxLength: 256, required: false },
        { name: "CFOP", type: "C", maxLength: 4, required: false },
        { name: "Valor do Frete", type: "N", maxLength: 12, decimals: 2, required: false },
    ]
  },
  PG: {
    fieldCount: 14,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Sequência", type: "N", maxLength: 2, required: true },
        { name: "Meio de pagamento", type: "N", maxLength: 2, required: true },
        { name: "Valor total", type: "N", maxLength: 12, decimals: 2, required: true },
        { name: "Parcela", type: "N", maxLength: 2, required: false },
        { name: "Parcelas", type: "N", maxLength: 2, required: false },
        { name: "Valor da parcela", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Vencimento", type: "D", maxLength: 8, required: false },
        { name: "Documento", type: "C", maxLength: 30, required: false },
        { name: "Código rede tef", type: "C", maxLength: 20, required: false },
        { name: "Nome rede tef", type: "C", maxLength: 20, required: false },
        { name: "GNF Vinculado", type: "N", maxLength: 6, required: false },
        { name: "Forma de pagamento TEF", type: "N", maxLength: 1, required: false },
        { name: "Bandeira", type: "C", maxLength: 50, required: false },
    ]
  },
  RC: {
    fieldCount: 10,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Sequência", type: "N", maxLength: 3, required: true },
        { name: "Tipo do documento", type: "C", maxLength: 3, required: true },
        { name: "Documento", type: "C", maxLength: 30, required: true },
        { name: "Vencimento", type: "D", maxLength: 8, required: true },
        { name: "Valor original", type: "N", maxLength: 12, decimals: 2, required: true },
        { name: "Multa", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Juros", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Desconto", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Valor pago", type: "N", maxLength: 12, decimals: 2, required: true },
    ]
  },
  CO: {
    fieldCount: 10,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Filial", type: "C", maxLength: 4, required: true },
        { name: "Ecf", type: "N", maxLength: 3, required: true },
        { name: "COO", type: "N", maxLength: 6, required: true },
        { name: "Data e hora do cancelamento", type: "T", maxLength: 14, required: true },
        { name: "Usuário cancelamento", type: "C", maxLength: 10, required: true },
        { name: "Modelo Nota", type: "C", maxLength: 4, required: false },
        { name: "Série Nota", type: "C", maxLength: 4, required: false },
        { name: "Número Nota", type: "C", maxLength: 11, required: false },
        { name: "Série Equipamento SAT/ECF", type: "C", maxLength: 20, required: false },
    ]
  },
  XL: {
    fieldCount: 2,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "XML", type: "C", maxLength: Infinity, required: true },
    ]
  },
  INT: {
    fieldCount: 5,
    fields: [
        { name: "Identificação", type: "C", maxLength: 3, required: true },
        { name: "Filial", type: "C", maxLength: 4, required: true },
        { name: "Modelo Nota", type: "C", maxLength: 4, required: true },
        { name: "Série Nota", type: "C", maxLength: 4, required: true },
        { name: "Número Nota", type: "C", maxLength: 11, required: true },
    ]
  },
  RZ: {
    fieldCount: 13,
    fields: [
      { name: "Identificação", type: "C", maxLength: 2, required: true },
      { name: "Reservado", type: "C", maxLength: 4, required: false },
      { name: "Filial", type: "C", maxLength: 4, required: true },
      { name: "Ecf", type: "N", maxLength: 3, required: true },
      { name: "Modelo", type: "C", maxLength: 20, required: true },
      { name: "Número de série", type: "C", maxLength: 20, required: true },
      { name: "Data", type: "D", maxLength: 8, required: true },
      { name: "CRO", type: "N", maxLength: 6, required: true },
      { name: "CRZ", type: "N", maxLength: 6, required: true },
      { name: "GT Final", type: "N", maxLength: 12, decimals: 2, required: true },
      { name: "Venda bruta", type: "N", maxLength: 12, decimals: 2, required: true },
      { name: "Coo inicial", type: "N", maxLength: 6, required: true },
      { name: "Coo final", type: "N", maxLength: 6, required: true },
    ]
  },
  TP: {
    fieldCount: 5,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Reservado", type: "C", maxLength: 4, required: false },
        { name: "Código", type: "C", maxLength: 5, required: true },
        { name: "Valor", type: "N", maxLength: 12, decimals: 2, required: true },
        { name: "Reservado", type: "N", maxLength: 1, required: false },
    ]
  },
  CL: {
    fieldCount: 64,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Código", type: "C", maxLength: 10, required: false },
        { name: "Nome", type: "C", maxLength: 50, required: true },
        { name: "Razão Social", type: "C", maxLength: 50, required: false },
        { name: "CNPJ CPF", type: "C", maxLength: 18, required: false },
        { name: "Insc. Estadual", type: "C", maxLength: 20, required: false },
        { name: "RG", type: "C", maxLength: 20, required: false },
        { name: "Endereço", type: "C", maxLength: 50, required: false },
        { name: "Número", type: "N", maxLength: 6, required: false },
        { name: "Complemento", type: "C", maxLength: 50, required: false },
        { name: "Bairro", type: "C", maxLength: 50, required: false },
        { name: "CEP", type: "C", maxLength: 9, required: false },
        { name: "Telefone", type: "C", maxLength: 40, required: false },
        { name: "Celular", type: "C", maxLength: 40, required: false },
        { name: "Fax", type: "C", maxLength: 40, required: false },
        { name: "Email", type: "C", maxLength: 50, required: false },
        { name: "Data nascimento", type: "D", maxLength: 10, required: false },
        { name: "Limite crédito", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Nome Contato", type: "C", maxLength: 50, required: false },
        { name: "Estado Civil", type: "N", maxLength: 2, required: false },
        { name: "Conjuge", type: "C", maxLength: 50, required: false },
        { name: "Pai", type: "C", maxLength: 50, required: false },
        { name: "Mãe", type: "C", maxLength: 50, required: false },
        { name: "Profissão", type: "C", maxLength: 50, required: false },
        { name: "Renda", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Tipo", type: "C", maxLength: 20, required: false },
        { name: "Observação", type: "C", maxLength: Infinity, required: false },
        { name: "Cidade", type: "C", maxLength: 100, required: false },
        { name: "Estado", type: "C", maxLength: 2, required: true },
        { name: "Contato de entrega", type: "C", maxLength: 50, required: false },
        { name: "CEP de entrega", type: "C", maxLength: 9, required: false },
        { name: "Estado de entrega", type: "C", maxLength: 2, required: false },
        { name: "Cidade de entrega", type: "C", maxLength: 100, required: false },
        { name: "Endereço de entrega", type: "C", maxLength: 50, required: false },
        { name: "Número de entrega", type: "C", maxLength: 6, required: false },
        { name: "Complemento do endereço de entrega", type: "C", maxLength: 50, required: false },
        { name: "Bairro de entrega", type: "C", maxLength: 50, required: false },
        { name: "Telefone entrega", type: "C", maxLength: 40, required: false },
        { name: "Celular entrega", type: "C", maxLength: 40, required: false },
        { name: "Fax de entrega", type: "C", maxLength: 40, required: false },
        { name: "Email de entrega", type: "C", maxLength: 50, required: false },
        { name: "Inativo", type: "N", maxLength: 1, required: false },
        { name: "Nome do contato de cobrança", type: "C", maxLength: 50, required: false },
        { name: "Cep de cobrança", type: "C", maxLength: 9, required: false },
        { name: "Estado de cobrança", type: "C", maxLength: 2, required: false },
        { name: "Cidade de cobrança", type: "C", maxLength: 100, required: false },
        { name: "Endereço de cobrança", type: "C", maxLength: 50, required: false },
        { name: "Número do endereço de cobrança", type: "C", maxLength: 6, required: false },
        { name: "Complemento de cobrança", type: "C", maxLength: 50, required: false },
        { name: "Bairro de cobrança", type: "C", maxLength: 50, required: false },
        { name: "Campo extra 1", type: "C", maxLength: 512, required: false },
        { name: "Campo extra 2", type: "C", maxLength: 512, required: false },
        { name: "Campo extra 3", type: "C", maxLength: 512, required: false },
        { name: "Campo extra 4", type: "C", maxLength: 512, required: false },
        { name: "Campo extra 5", type: "C", maxLength: 512, required: false },
        { name: "Campo extra 6", type: "C", maxLength: 512, required: false },
        { name: "Usuário", type: "C", maxLength: 10, required: false },
        { name: "Cliente", type: "N", maxLength: 1, required: false },
        { name: "Fornecedor", type: "N", maxLength: 1, required: false },
        { name: "Informação se a entidade está Bloqueada", type: "N", maxLength: 1, required: false },
        { name: "Id pauta de preço preferencial", type: "N", maxLength: 14, required: false },
        { name: "Código condição de pagamento preferencial", type: "C", maxLength: 14, required: false },
        { name: "Campo em branco", type: "C", maxLength: 0, required: false },
        { name: "Tipo pessoa", type: "N", maxLength: 1, required: false },
    ]
  },
  PR: {
    fieldCount: 93,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Código", type: "C", maxLength: 20, required: false },
        { name: "Referencia", type: "C", maxLength: 60, required: false },
        { name: "Código EAN", type: "C", maxLength: 20, required: false },
        { name: "Inativo", type: "N", maxLength: 1, required: false },
        { name: "Nome", type: "C", maxLength: 50, required: false },
        { name: "Tipo", type: "C", maxLength: 1, required: false },
        { name: "Código do fornecedor", type: "C", maxLength: 14, required: false },
        { name: "Unidade de medida", type: "C", maxLength: 3, required: true },
        { name: "% Lucro", type: "N", maxLength: 6, decimals: 2, required: false },
        { name: "Preço", type: "N", maxLength: 12, decimals: 3, required: true },
        { name: "Peso", type: "N", maxLength: 12, decimals: 3, required: false },
        { name: "Numero de série", type: "N", maxLength: 2, required: false },
        { name: "Tributação ICMS", type: "C", maxLength: 2, required: false },
        { name: "IPI", type: "N", maxLength: 5, decimals: 2, required: false },
        { name: "Situação tributaria", type: "C", maxLength: 2, required: false },
        { name: "Custo", type: "N", maxLength: 12, decimals: 3, required: false },
        { name: "IAT", type: "C", maxLength: 2, required: false },
        { name: "IPPT", type: "C", maxLength: 2, required: false },
        { name: "Origem", type: "C", maxLength: 2, required: false },
        { name: "Grupo", type: "C", maxLength: 40, required: false },
        { name: "Fornecedor", type: "C", maxLength: 50, required: false },
        { name: "Caminho da imagem", type: "C", maxLength: 200, required: false },
        { name: "ICMS", type: "N", maxLength: 4, decimals: 2, required: false },
        { name: "Tributação especial", type: "C", maxLength: 10, required: false },
        { name: "Casas decimais da unidade de medida", type: "N", maxLength: 1, required: false },
        { name: "Código do grupo", type: "C", maxLength: 30, required: false },
        { name: "Pesavel", type: "N", maxLength: 1, required: false },
        { name: "Tipo produto", type: "C", maxLength: 2, required: false },
        { name: "OBS", type: "C", maxLength: Infinity, required: false },
        { name: "Pauta preco1", type: "N", maxLength: 15, decimals: 6, required: false },
        { name: "Pauta preco2", type: "N", maxLength: 15, decimals: 6, required: false },
        { name: "Pauta preco3", type: "N", maxLength: 15, decimals: 6, required: false },
        { name: "Pauta preco4", type: "N", maxLength: 15, decimals: 6, required: false },
        { name: "NCM", type: "C", maxLength: 10, required: false },
        { name: "Tributação do Simples Nacional NF-e", type: "N", maxLength: 3, required: false },
        { name: "CST Pis/Cofins saída", type: "C", maxLength: 2, required: false },
        { name: "Alíquota Pis saída", type: "N", maxLength: 5, decimals: 2, required: false },
        { name: "Alíquota Cofins saída", type: "N", maxLength: 5, decimals: 2, required: false },
        { name: "CST Pis/Cofins entrada", type: "C", maxLength: 2, required: false },
        { name: "Alíquota Pis entrada", type: "N", maxLength: 5, decimals: 4, required: false },
        { name: "Alíquota Cofins entrada", type: "N", maxLength: 5, decimals: 4, required: false },
        { name: "Permite informar dimensões", type: "N", maxLength: 1, required: false },
        { name: "CFOP interna de entrada", type: "C", maxLength: 6, required: false },
        { name: "CFOP interna de saida", type: "C", maxLength: 6, required: false },
        { name: "CFOP externa de entrada", type: "C", maxLength: 6, required: false },
        { name: "CFOP externa de saida", type: "C", maxLength: 6, required: false },
        { name: "CFOP interna de entrada devolucao", type: "C", maxLength: 6, required: false },
        { name: "CFOP interna de saida devolucao", type: "C", maxLength: 6, required: false },
        { name: "CFOP externa de entrada devolução", type: "C", maxLength: 6, required: false },
        { name: "CFOP externa de saida devolução", type: "C", maxLength: 6, required: false },
        { name: "CFOP interna de entrada transferência", type: "C", maxLength: 6, required: false },
        { name: "CFOP interna de saida transferência", type: "C", maxLength: 6, required: false },
        { name: "CFOP externa de entrada transferência", type: "C", maxLength: 6, required: false },
        { name: "CFOP externa de saida transferência", type: "C", maxLength: 6, required: false },
        { name: "CFOP Externa de saída para não contribuinte", type: "C", maxLength: 6, required: false },
        { name: "Informação extra 1", type: "C", maxLength: 50, required: false },
        { name: "Informação extra 2", type: "C", maxLength: 50, required: false },
        { name: "Informação extra 3", type: "C", maxLength: 50, required: false },
        { name: "Informação extra 4", type: "C", maxLength: 50, required: false },
        { name: "Informação extra 5", type: "C", maxLength: 50, required: false },
        { name: "Informação extra 6", type: "C", maxLength: 50, required: false },
        { name: "CEST", type: "C", maxLength: 10, required: false },
        { name: "Informação adicional", type: "C", maxLength: 500, required: false },
        { name: "Tributação do Simples Nacional – NFC-e ou SAT", type: "N", maxLength: 3, required: false },
        { name: "Custo médio inicial", type: "N", maxLength: 15, decimals: 6, required: false },
        { name: "Código da Lei complementar", type: "C", maxLength: 10, required: false },
        { name: "Indicador da exigibilidade do ISS", type: "N", maxLength: 1, required: false },
        { name: "Código da Receita sem contribuição", type: "C", maxLength: 10, required: false },
        { name: "Situação tributária especial para NFC-e/SAT", type: "C", maxLength: 3, required: false },
        { name: "Enviar produto ao E-Commerce", type: "N", maxLength: 1, required: false },
        { name: "Nome PDV", type: "C", maxLength: 120, required: false },
        { name: "Descrição Uniplus Shop", type: "C", maxLength: 4096, required: false },
        { name: "Informações no Uniplus Shop", type: "C", maxLength: 4096, required: false },
        { name: "Código do fabricante", type: "C", maxLength: 10, required: false },
        { name: "Peso shop", type: "N", maxLength: 12, decimals: 3, required: false },
        { name: "Altura shop", type: "N", maxLength: 12, decimals: 1, required: false },
        { name: "Largura shop", type: "N", maxLength: 12, decimals: 1, required: false },
        { name: "Comprimento shop", type: "N", maxLength: 12, decimals: 1, required: false },
        { name: "Tipo embalagem shop", type: "N", maxLength: 1, required: false },
        { name: "Informação Extra Balança 1", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 2", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 3", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 4", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 5", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 6", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 7", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 8", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 9", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 10", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 11", type: "C", maxLength: 100, required: false },
        { name: "Informação Extra Balança 12", type: "C", maxLength: 100, required: false },
        { name: "Códigos Empresas", type: "C", maxLength: 10, required: false },
    ]
  },
  VR: {
    fieldCount: 6,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Código do produto", type: "C", maxLength: 20, required: true },
        { name: "Descrição", type: "C", maxLength: 30, required: true },
        { name: "Tipo registro", type: "C", maxLength: 1, required: true },
        { name: "Ordem", type: "C", maxLength: 5, required: true },
        { name: "Código do cadastro de grade", type: "C", maxLength: 100, required: true },
    ]
  },
  PB: {
    fieldCount: 4,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Código do produto", type: "C", maxLength: 20, required: true },
        { name: "EAN", type: "C", maxLength: 20, required: true },
        { name: "Variação", type: "C", maxLength: 5, required: false },
    ]
  },
  PS: {
    fieldCount: 3,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Código do produto", type: "C", maxLength: 20, required: true },
        { name: "Codigo do produto similar", type: "C", maxLength: 20, required: true },
    ]
  },
  NCM: {
    fieldCount: 9,
    fields: [
        { name: "Identificação", type: "C", maxLength: 3, required: true },
        { name: "Código do NCM", type: "C", maxLength: 10, required: true },
        { name: "Código de exceção", type: "C", maxLength: 3, required: false },
        { name: "Descrição", type: "C", maxLength: 200, required: false },
        { name: "Tipo", type: "C", maxLength: 1, required: false },
        { name: "Percentual do MVA", type: "N", maxLength: 5, decimals: 2, required: false },
        { name: "Percentual de Redução do MVA", type: "N", maxLength: 5, decimals: 2, required: false },
        { name: "Percentual imposto aproximado", type: "N", maxLength: 5, decimals: 2, required: false },
        { name: "Percentual imposto aprox. importação", type: "N", maxLength: 5, decimals: 2, required: false },
    ]
  },
  EM: {
    fieldCount: 7,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Código do produto", type: "C", maxLength: 20, required: true },
        { name: "Unidade de medida", type: "C", maxLength: 3, required: true },
        { name: "Fator de conversão", type: "N", maxLength: 15, decimals: 6, required: true },
        { name: "Tipo da embalagem", type: "C", maxLength: 1, required: true },
        { name: "Preço", type: "N", maxLength: 15, decimals: 6, required: true },
        { name: "EAN", type: "C", maxLength: 20, required: false },
    ]
  },
  ES: {
    fieldCount: 8,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Produto", type: "C", maxLength: 20, required: true },
        { name: "Filial", type: "C", maxLength: 4, required: false },
        { name: "Quantidade", type: "N", maxLength: 12, decimals: 3, required: false },
        { name: "Variação", type: "C", maxLength: 5, required: false },
        { name: "Preço de custo", type: "N", maxLength: 15, decimals: 6, required: false },
        { name: "Custo médio", type: "N", maxLength: 15, decimals: 6, required: false },
        { name: "Local de estoque", type: "C", maxLength: 5, required: false },
    ]
  },
  DV: {
    fieldCount: 29,
    fields: [
        { name: "Identificação do registro", type: "C", maxLength: 2, required: true },
        { name: "Código", type: "C", maxLength: 14, required: true },
        { name: "Filial", type: "C", maxLength: 4, required: false },
        { name: "Tipo DAV", type: "N", maxLength: 1, required: false },
        { name: "Valor", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Data", type: "D", maxLength: 8, required: true },
        { name: "Cliente", type: "C", maxLength: 14, required: false },
        { name: "Vendedor", type: "C", maxLength: 14, required: false },
        { name: "Código da Condição de pagamento preferencial", type: "C", maxLength: 6, required: false },
        { name: "Desconto sub-total", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Código de identificação", type: "C", maxLength: 20, required: false },
        { name: "Observação", type: "C", maxLength: Infinity, required: false },
        { name: "Código da pauta", type: "N", maxLength: 1, required: false },
        { name: "Código do tipo de frete", type: "N", maxLength: 1, required: false },
        { name: "Código da transportadora", type: "C", maxLength: 14, required: false },
        { name: "Cep de entrega", type: "C", maxLength: 8, required: false },
        { name: "Estado de entrega", type: "C", maxLength: 2, required: false },
        { name: "Cidade de entrega", type: "C", maxLength: 40, required: false },
        { name: "Endereço de entrega", type: "C", maxLength: 50, required: false },
        { name: "Número da entrega", type: "C", maxLength: 6, required: false },
        { name: "Complemento do endereço de entrega", type: "C", maxLength: 50, required: false },
        { name: "Bairro de entrega", type: "C", maxLength: 50, required: false },
        { name: "Status da DAV", type: "N", maxLength: 1, required: false },
        { name: "Valor do frete", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Valor desconto dos itens", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Percentual desconto subtotal", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Id do tipo de documento financeiro", type: "N", maxLength: 12, required: false },
        { name: "Campo extra 1", type: "C", maxLength: 512, required: false },
        { name: "Campo extra 2", type: "C", maxLength: 512, required: false },
    ]
  },
  ID: {
    fieldCount: 14,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Produto", type: "C", maxLength: 20, required: true },
        { name: "Quantidade", type: "N", maxLength: 12, decimals: 3, required: true },
        { name: "Preço da unidade", type: "N", maxLength: 12, decimals: 3, required: true },
        { name: "Desconto", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Valor total", type: "N", maxLength: 12, decimals: 2, required: false },
        { name: "Número de série", type: "C", maxLength: 20, required: false },
        { name: "Código do DAV", type: "C", maxLength: 14, required: true },
        { name: "Número do item", type: "N", maxLength: 3, required: false },
        { name: "Brinde", type: "N", maxLength: 1, required: false },
        { name: "Tipo de desconto", type: "N", maxLength: 1, required: false },
        { name: "Unidade de medida", type: "C", maxLength: 6, required: false },
        { name: "Variações", type: "C", maxLength: 500, required: false },
        { name: "Informações adicionais", type: "C", maxLength: 500, required: false },
    ]
  },
  US: {
    fieldCount: 7,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Código", type: "C", maxLength: 10, required: true },
        { name: "Nome", type: "C", maxLength: 40, required: true },
        { name: "Senha", type: "C", maxLength: 40, required: true },
        { name: "Supervisor", type: "N", maxLength: 1, required: false },
        { name: "%Desconto máximo", type: "N", maxLength: 5, decimals: 2, required: false },
        { name: "ID do perfil", type: "N", maxLength: 3, required: true },
    ]
  },
  CP: {
    fieldCount: 5,
    fields: [
        { name: "Identificação", type: "C", maxLength: 2, required: true },
        { name: "Codigo", type: "C", maxLength: 6, required: true },
        { name: "Descricao", type: "C", maxLength: 50, required: true },
        { name: "Prazos", type: "C", maxLength: 128, required: true },
        { name: "Multiplicar por", type: "N", maxLength: 5, decimals: 4, required: false },
    ]
  },
};

type LineError = { message: string; columnIndex: number; isFieldCountError?: boolean };

type LineResult = {
  lineNumber: number;
  originalLineContent: string;
  currentLineContent: string;
  recordType?: string;
  errors: LineError[];
  isCorrected?: boolean;
};

type ErrorOccurrence = {
    line: LineResult;
    field?: FieldRule;
    error: LineError;
};

type GroupedErrors = {
    [key: string]: ErrorOccurrence[];
};

type ErrorView = 'list' | 'grouped';

const recordTypeNames: { [key: string]: string } = {
    OP: "Operação",
    IT: "Itens Vendidos",
    PG: "Meios de Pagamento",
    RC: "Recebimento",
    CO: "Cancelamento",
    XL: "XML",
    INT: "Inutilização",
    RZ: "Redução Z",
    TP: "Totalizador",
    CL: "Clientes",
    PR: "Produtos",
    VR: "Variação",
    PB: "Cód. Barras",
    PS: "Similares",
    NCM: "NCM",
    EM: "Embalagens",
    ES: "Estoque",
    DV: "DAV",
    ID: "Item DAV",
    US: "Usuários",
    CP: "Cond. Pagamento",
};

function InvalidLineItem({ result, onUpdateLine }: { result: LineResult; onUpdateLine: (lineNumber: number, newContent: string) => void; }) {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (editorRef.current) {
        onUpdateLine(result.lineNumber, editorRef.current.innerText);
    }
    setIsEditing(false);
  };
  
  const getHighlightedLine = (lineContent: string, isCorrected?: boolean) => {
    const fields = lineContent.split(';');
    const rule = result.recordType ? validationRules[result.recordType] : undefined;
    const expectedFieldCount = rule?.fieldCount;
    const isFieldCountError = result.errors.some(e => e.isFieldCountError);
    const errorColumns = result.errors.map(e => e.columnIndex);
  
    return (
      <div 
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        className={cn(
            "font-mono text-xs whitespace-pre-wrap break-all p-2 rounded-md border",
            isEditing 
                ? "bg-white dark:bg-black focus:outline-blue-500 focus:ring-2 ring-blue-300"
                : isCorrected ? "bg-green-100/50 dark:bg-green-900/30" : "bg-secondary/50"
        )}
      >
        {fields.map((field, index) => {
          let isError = errorColumns.includes(index) && !isCorrected;
          if (!isError && isFieldCountError && expectedFieldCount && result.recordType !== 'XL' && index >= expectedFieldCount) {
            isError = true;
          }
          return (
            <span key={index} className={cn(isError ? "bg-red-200 text-red-900 rounded-sm p-0.5" : "")}>
              {field}{index < fields.length - 1 && <span className="text-gray-400 mx-px">;</span>}
            </span>
          )
        })}
      </div>
    );
  };

  return (
    <div className={cn(
        "p-3 border-b mb-2 rounded-lg",
        result.isCorrected ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700" : "bg-secondary/30"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-semibold text-sm">Linha {result.lineNumber}:</div>
            <Badge variant={result.isCorrected ? "default" : "destructive"} className={cn(result.isCorrected && "bg-green-600")}>
                {result.recordType || 'N/A'}
            </Badge>
          </div>
          <div className="mt-1">
            {getHighlightedLine(result.currentLineContent, result.isCorrected)}
          </div>
          {isEditing && (
             <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Salvar</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
            </div>
          )}
        </div>
        {!isEditing && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
            </Button>
        )}
      </div>
      {result.errors.length > 0 && !result.isCorrected && (
        <div className="mt-2 pl-1">
            <h4 className="font-semibold text-sm mb-1 text-red-800">Erros Encontrados na Linha:</h4>
            <ul className="space-y-1 list-disc pl-5">
            {result.errors.map((error, index) => {
                const fieldRule = result.recordType && error.columnIndex >= 0 ? validationRules[result.recordType]?.fields[error.columnIndex] : null;
                const fieldName = fieldRule ? fieldRule.name : 'Geral';
                return (
                <li key={index} className="text-red-700 text-xs font-sans">
                    <b>{fieldName} (Campo {error.columnIndex + 1}):</b> {error.message}
                </li>
                );
            })}
            </ul>
        </div>
      )}
       {result.isCorrected && (
        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 p-2 bg-green-100 dark:bg-green-900/50 rounded-md">
            <CheckCircle className="h-4 w-4"/>
            <span>Linha corrigida com sucesso!</span>
        </div>
       )}
    </div>
  );
}


function GroupedInvalidLinesList({ invalidLines, onUpdateLine }: { invalidLines: LineResult[], onUpdateLine: (lineNumber: number, newContent: string) => void; }) {
  const groupedErrors = useMemo<GroupedErrors>(() => {
    const allErrors: ErrorOccurrence[] = [];
    invalidLines.forEach(line => {
        if (line.isCorrected) return; // Do not include corrected lines in error groups
        line.errors.forEach(error => {
            const rule = line.recordType ? validationRules[line.recordType] : undefined;
            const field = rule && error.columnIndex >= 0 ? rule.fields[error.columnIndex] : undefined;
            allErrors.push({ line, field, error });
        });
    });

    return allErrors.reduce((acc, occurrence) => {
        const mainErrorMessage = occurrence.error.message.split(' Sugestão:')[0] || 'Erro desconhecido';
        if (!acc[mainErrorMessage]) {
            acc[mainErrorMessage] = [];
        }
        acc[mainErrorMessage].push(occurrence);
        return acc;
    }, {} as GroupedErrors);
  }, [invalidLines]);
  
  const correctedLines = useMemo(() => invalidLines.filter(line => line.isCorrected), [invalidLines]);

  return (
    <ScrollArea className="h-96 w-full rounded-md border">
      <Accordion type="multiple" className="p-4">
        {correctedLines.length > 0 && (
            <AccordionItem value="corrected-lines" className="border-green-300 dark:border-green-700">
                 <AccordionTrigger className="text-sm hover:no-underline text-green-700 dark:text-green-300">
                    <div className="flex items-center gap-2 text-left">
                        <CheckCircle className="h-4 w-4 shrink-0"/>
                        <span>Linhas Corrigidas <Badge className="bg-green-600 hover:bg-green-700">{correctedLines.length}</Badge></span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    {correctedLines.map((line) => (
                        <InvalidLineItem key={line.lineNumber} result={line} onUpdateLine={onUpdateLine} />
                    ))}
                </AccordionContent>
            </AccordionItem>
        )}
        {Object.entries(groupedErrors).map(([errorMessage, occurrences]) => (
          <AccordionItem value={errorMessage} key={errorMessage}>
            <AccordionTrigger className="text-sm hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0"/>
                    <span>{errorMessage} <Badge variant="destructive">{occurrences.length} ocorrência(s)</Badge></span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {occurrences.map(({ line }, index) => (
                  <InvalidLineItem key={`${line.lineNumber}-${index}`} result={line} onUpdateLine={onUpdateLine} />
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
}

function SimpleInvalidLinesList({ invalidLines, onUpdateLine }: { invalidLines: LineResult[], onUpdateLine: (lineNumber: number, newContent: string) => void; }) {
    return (
        <ScrollArea className="h-96 w-full rounded-md border">
            <div className="p-4">
            {invalidLines.map((result) => (
                <InvalidLineItem key={result.lineNumber} result={result} onUpdateLine={onUpdateLine} />
            ))}
            </div>
        </ScrollArea>
    );
}


export function FileValidator() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LineResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("errors");
  const [isConfirmingCorrection, setIsConfirmingCorrection] = useState(false);
  const [errorView, setErrorView] = useState<ErrorView>('grouped');


  const handleFileDrop = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    const isTxt = selectedFile.name.toLowerCase().endsWith(".txt");
    const isCsv = selectedFile.name.toLowerCase().endsWith(".csv");

    if (isTxt || isCsv) {
      setFile(selectedFile);
      setResults([]);
      handleValidate(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione um arquivo .txt ou .csv.",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileDrop(event.target.files?.[0]);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileDrop(event.dataTransfer.files?.[0]);
  };


  const handleRemoveFile = () => {
    setFile(null);
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateLine = (line: string, lineNumber: number): LineResult => {
    const lineErrors: LineResult['errors'] = [];
    const fields = line.split(";");
    const recordType = fields[0]?.trim();
  
    if (!recordType && line.trim() === '') {
      return { lineNumber, originalLineContent: line, currentLineContent: line, errors: [] }; // Ignore empty lines
    }
  
    const rule = validationRules[recordType];
    if (!rule) {
      lineErrors.push({ message: `Tipo de registro desconhecido '${recordType}'. Sugestão: Verifique se o identificador no início da linha está correto.`, columnIndex: 0 });
    } else {
      if (recordType !== 'XL' && fields.length !== rule.fieldCount) {
        const message = fields.length > rule.fieldCount
          ? `O registro '${recordType}' espera ${rule.fieldCount} campos, mas ${fields.length} foram encontrados. Sugestão: Remova os campos excedentes ou verifique se há ';' extras no conteúdo.`
          : `O registro '${recordType}' espera ${rule.fieldCount} campos, mas apenas ${fields.length} foram encontrados. Sugestão: Preencha os campos faltantes mantendo a ordem correta.`;
        
        lineErrors.push({
          message: message,
          columnIndex: -1, // General line error
          isFieldCountError: true,
        });
      }
  
      rule.fields.forEach((fieldRule, index) => {
        if (recordType !== 'XL' && index >= rule.fieldCount) return;
        if (index >= fields.length) return; // Don't validate fields that don't exist due to wrong field count
        const fieldValue = fields[index]?.trim();
  
        if (fieldRule.required && !fieldValue) {
          lineErrors.push({ message: `Campo obrigatório não preenchido. Sugestão: Insira um valor válido.`, columnIndex: index });
        }
  
        if (fieldValue) {
          if (fieldRule.maxLength !== Infinity && fieldValue.length > fieldRule.maxLength) {
            lineErrors.push({ message: `Excede o tamanho máximo de ${fieldRule.maxLength} (atual: ${fieldValue.length}). Sugestão: Reduza o conteúdo do campo.`, columnIndex: index });
          }
          
          if (fieldRule.type === 'N') {
            if (!/^-?\d*[,.]?\d*$/.test(fieldValue.replace(/\./g, ''))) {
              lineErrors.push({ message: `Deve ser um valor numérico. Sugestão: Remova caracteres não numéricos.`, columnIndex: index });
            } else if (fieldRule.decimals !== undefined) {
              const parts = fieldValue.split(',');
              if (parts[1] && parts[1].length > fieldRule.decimals) {
                 lineErrors.push({ message: `Deve ter no máximo ${fieldRule.decimals} casas decimais. Sugestão: Arredonde ou ajuste o valor.`, columnIndex: index });
              }
            }
          } else if (fieldRule.type === 'D' && !/^\d{8}$/.test(fieldValue)) {
            lineErrors.push({ message: `Deve estar no formato de data AAAAMMDD. Sugestão: Corrija o formato (ex: 20240801).`, columnIndex: index });
          } else if (fieldRule.type === 'T' && !/^\d{14}$/.test(fieldValue)) {
            lineErrors.push({ message: `Deve estar no formato de data/hora AAAAMMDDHHMMSS. Sugestão: Corrija o formato (ex: 20240801153000).`, columnIndex: index });
          }
        }
      });
    }
  
    return { lineNumber, originalLineContent: line, currentLineContent: line, recordType, errors: lineErrors };
  };

  const handleValidate = (fileToValidate: File) => {
    if (!fileToValidate) return;
    setLoading(true);
    setResults([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const decoder = new TextDecoder('utf-8');
      const content = decoder.decode(buffer);

      const lines = content.split(/\r?\n/);
      const validationResults = lines.map((line, index) => validateLine(line, index + 1));
      
      setResults(validationResults);
      
      const invalidCount = validationResults.filter(r => r.errors.length > 0).length;
      if (invalidCount > 0) {
        setActiveTab("errors");
      } else {
        setActiveTab("valid");
      }

      setLoading(false);
    };
    reader.onerror = () => {
        setLoading(false);
        toast({
            variant: "destructive",
            title: "Erro de leitura",
            description: "Houve um erro ao tentar ler o arquivo.",
        });
    }
    reader.readAsArrayBuffer(fileToValidate);
  };
  
  const handleManualLineUpdate = (lineNumber: number, newContent: string) => {
    setResults(prevResults => {
        return prevResults.map(res => {
            if (res.lineNumber === lineNumber) {
                // Re-validate the manually corrected line to update its error state
                const newValidation = validateLine(newContent, lineNumber);
                const isCorrected = res.errors.length > 0 && newValidation.errors.length === 0;
                return { ...newValidation, currentLineContent: newContent, originalLineContent: res.originalLineContent, isCorrected };
            }
            return res;
        });
    });
  };

  const correctLine = (lineResult: LineResult): string => {
    if (lineResult.errors.length === 0) return lineResult.currentLineContent;
    
    const { recordType } = lineResult;
    const rule = recordType ? validationRules[recordType] : undefined;

    if (!rule) return lineResult.currentLineContent; // Cannot correct without rules

    let fields = lineResult.currentLineContent.split(';');

    // Rule 1: Field count
    if (recordType !== 'XL' && fields.length < rule.fieldCount) {
        fields = [...fields, ...Array(rule.fieldCount - fields.length).fill('')];
    } else if (recordType !== 'XL' && fields.length > rule.fieldCount) {
        fields.length = rule.fieldCount;
    }
    
    fields = fields.map((field, index) => {
        const fieldRule = rule.fields[index];
        if (!fieldRule) return field;

        let correctedField = field.trim();

        // Rule 2: Required
        if (fieldRule.required && !correctedField) {
            if (fieldRule.type === 'N') correctedField = '0';
        }

        // Rule 3: Type and Length
        if (correctedField) {
            if (fieldRule.type === 'N') {
                let numericValue = correctedField.replace(/[^0-9,-]/g, '').replace(',', '.');
                const parts = numericValue.split('.');
                if (parts.length > 2) numericValue = parts[0] + '.' + parts.slice(1).join('');
                if (numericValue.startsWith('.')) numericValue = '0' + numericValue;
                if (numericValue.endsWith('.')) numericValue = numericValue.slice(0, -1);
                
                if (fieldRule.decimals !== undefined) {
                    const number = parseFloat(numericValue);
                    if (!isNaN(number)) {
                        numericValue = number.toFixed(fieldRule.decimals);
                    }
                }
                correctedField = numericValue.replace('.', ',');
            }

            // Max Length
            if (fieldRule.maxLength !== Infinity && correctedField.length > fieldRule.maxLength) {
                correctedField = correctedField.substring(0, fieldRule.maxLength);
            }
        }
        
        return correctedField;
    });

    return fields.join(';');
  }
  
  const handleConfirmCorrection = () => {
    setIsConfirmingCorrection(true);
  };
  
  const handleProceedWithCorrection = (isAuto: boolean) => {
    if (results.length === 0) {
        toast({ title: "Nenhum resultado para processar", description: "Valide um arquivo primeiro." });
        setIsConfirmingCorrection(false);
        return;
    }
  
    const correctedLines = results.map(result => {
        if (isAuto) {
           return result.errors.length > 0 ? correctLine(result) : result.currentLineContent;
        }
        // For manual correction, just use the current state of the line
        return result.currentLineContent;
    });
  
    const correctedContent = correctedLines.join('\n');
    const blob = new Blob([correctedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalFileName = file?.name.replace(/\.[^/.]+$/, "") || "arquivo";
    a.download = `${originalFileName}_corrigido${isAuto ? '_auto' : '_manual'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Arquivo Corrigido", description: `O download do arquivo corrigido (${isAuto ? 'automático' : 'manual'}) foi iniciado.` });
    setIsConfirmingCorrection(false);
  };

  const handleExportPdf = () => {
    if (!file || invalidLines.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum erro para exportar",
        description: "Não há linhas com erros para gerar o relatório em PDF.",
      });
      return;
    }
  
    const doc = new jsPDF({ orientation: "landscape" });
    
    doc.setFontSize(18);
    doc.text("Relatório de Validação de Arquivo", 14, 22);
    doc.setFontSize(11);
    doc.text(`Arquivo: ${file.name}`, 14, 30);
    doc.text(`Data: ${new Date().toLocaleString()}`, 14, 36);
  
    const tableData = invalidLines.map(line => {
        const errorsText = line.errors.map(e => {
            const fieldName = line.recordType && e.columnIndex >= 0 ? validationRules[line.recordType]?.fields[e.columnIndex]?.name : 'Geral';
            return `${fieldName} (Campo ${e.columnIndex >= 0 ? e.columnIndex + 1 : '-' }): ${e.message}`;
        }).join('\n');

        return [
            line.lineNumber,
            line.recordType || 'N/A',
            line.currentLineContent,
            errorsText
        ];
    });
  
    autoTable(doc, {
      startY: 45,
      head: [['Linha', 'Tipo', 'Conteúdo da Linha', 'Erros Encontrados']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [22, 163, 74], // Tailwind green-600
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 15 },
        2: { cellWidth: 120 },
        3: { cellWidth: 'auto' },
      },
    });
  
    const originalFileName = file.name.replace(/\.[^/.]+$/, "") || "arquivo";
    doc.save(`relatorio_erros_${originalFileName}.pdf`);
  
    toast({
        title: "Relatório PDF Gerado",
        description: "O download do seu relatório de erros foi iniciado.",
    });
  }


  const { validLines, invalidLines, fileContent } = useMemo(() => {
    const valid: LineResult[] = [];
    const invalid: LineResult[] = [];
    let content = "";
    
    results.forEach(r => {
      if (r.originalLineContent.trim() !== '') {
        if (r.errors.length === 0) {
          valid.push(r);
        } else {
          invalid.push(r);
        }
      }
      if (r.originalLineContent) {
        content += r.originalLineContent + '\n';
      }
    });

    return { validLines: valid, invalidLines: invalid, fileContent: content };
  }, [results]);

  const stats = useMemo(() => {
    const totalLines = results.filter(r => r.originalLineContent.trim() !== '').length;
    const currentValidCount = results.filter(r => r.errors.length === 0 && r.originalLineContent.trim() !== '').length;
    const currentInvalidCount = totalLines - currentValidCount;
    const recordTypes = [...new Set(results.map(r => r.recordType).filter(Boolean))];
    const recordTypeNamesFound = recordTypes.map(rt => recordTypeNames[rt!] || rt).join(', ');

    return { 
        totalLines, 
        validLines: currentValidCount, 
        invalidLines: currentInvalidCount,
        recordTypes: recordTypeNamesFound || 'Nenhum'
    };
  }, [results]);


  if (!file && !loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <Card className="w-full shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                        Validador R2D2
                        </CardTitle>
                        <Badge variant="outline">BETA</Badge>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Ajuda</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Como Usar o Validador R2D2</DialogTitle>
                                <DialogDescription>
                                    Um guia rápido para aproveitar ao máximo a ferramenta.
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] pr-6">
                            <div className="space-y-4 text-sm">
                                <section>
                                    <h3 className="font-semibold text-base mb-2">1. Carregando um Arquivo</h3>
                                    <p>Para começar, carregue um arquivo de importação no formato <strong>.txt</strong> ou <strong>.csv</strong>. Você pode clicar na área designada para abrir o seletor de arquivos ou simplesmente arrastar e soltar o arquivo na tela.</p>
                                </section>
                                <section>
                                    <h3 className="font-semibold text-base mb-2">2. Analisando os Resultados</h3>
                                    <p>Após a validação, a ferramenta exibirá os resultados em abas:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li><strong>Linhas com Erro:</strong> Lista todas as linhas que não seguem o layout R2D2. Os campos problemáticos são destacados em vermelho.</li>
                                        <li><strong>Linhas Válidas:</strong> Mostra todas as linhas que foram validadas com sucesso.</li>
                                        <li><strong>Arquivo Original:</strong> Exibe o conteúdo completo do arquivo que você enviou.</li>
                                    </ul>
                                </section>
                                <section>
                                    <h3 className="font-semibold text-base mb-2">3. Corrigindo Erros</h3>
                                    <p>Na aba de erros, você tem duas formas de visualizar e corrigir:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li><strong>Visão por Linhas:</strong> Mostra cada linha com erro individualmente.</li>
                                        <li><strong>Agrupar Erros:</strong> Agrupa os erros por tipo (ex: "Campo obrigatório não preenchido"), facilitando a identificação de problemas recorrentes. Expanda um grupo para ver todas as linhas afetadas.</li>
                                        <li><strong>Edição Manual:</strong> Clique no ícone de <Edit className="inline h-4 w-4" /> para tornar uma linha editável. Corrija o conteúdo e clique em "Salvar". O destaque no campo com erro ajuda a identificar o que precisa ser ajustado.</li>
                                    </ul>
                                </section>
                                <section>
                                    <h3 className="font-semibold text-base mb-2">4. Baixando o Arquivo Corrigido</h3>
                                    <p>Após fazer as edições manuais, clique no botão <strong>"Corrigir e Baixar"</strong>. Você terá duas opções:</p>
                                     <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li><strong>Baixar com Correções Manuais:</strong> Gera um novo arquivo contendo apenas as alterações que você fez manualmente.</li>
                                        <li><strong>Usar Correção Automática:</strong> A ferramenta tentará corrigir os erros restantes automaticamente. <strong>Atenção:</strong> Use esta opção com cuidado, pois a correção automática pode não ser perfeita para todos os casos.</li>
                                    </ul>
                                </section>
                                 <section>
                                    <h3 className="font-semibold text-base mb-2">5. Exportando Relatório de Erros</h3>
                                    <p>Se preferir, você pode exportar um relatório em PDF de todas as linhas com erro clicando em <strong>"Exportar PDF"</strong>. Isso é útil para compartilhar o status do arquivo com outras pessoas.</p>
                                </section>
                            </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>
                <CardDescription>
                Faça o upload de um arquivo de importação (.txt ou .csv) para validar
                sua estrutura.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Label
                    htmlFor="file-upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors",
                        { "pointer-events-none opacity-50": loading },
                        { "bg-secondary/80 border-primary": isDragging }
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
                    <p className="text-xs text-muted-foreground">
                        Arquivo de importação .TXT ou .CSV
                    </p>
                    </div>
                </Label>
                <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.csv"
                    className="sr-only"
                    disabled={loading}
                />
            </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground">Validando arquivo...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
        <Input
            id="file-upload-hidden"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.csv"
            className="sr-only"
            disabled={loading}
        />
        {results.length > 0 && (
            <Card className="animate-in fade-in-50 duration-500">
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>Resultado da Validação</CardTitle>
                            <CardDescription>Arquivo: {file?.name}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                           <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <HelpCircle className="h-4 w-4" />
                                        <span className="sr-only">Ajuda</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Como Usar o Validador R2D2</DialogTitle>
                                        <DialogDescription>
                                            Um guia rápido para aproveitar ao máximo a ferramenta.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="max-h-[70vh] pr-6">
                                    <div className="space-y-4 text-sm">
                                        <section>
                                            <h3 className="font-semibold text-base mb-2">1. Carregando um Arquivo</h3>
                                            <p>Para começar, carregue um arquivo de importação no formato <strong>.txt</strong> ou <strong>.csv</strong>. Você pode clicar na área designada para abrir o seletor de arquivos ou simplesmente arrastar e soltar o arquivo na tela.</p>
                                        </section>
                                        <section>
                                            <h3 className="font-semibold text-base mb-2">2. Analisando os Resultados</h3>
                                            <p>Após a validação, a ferramenta exibirá os resultados em abas:</p>
                                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                                <li><strong>Linhas com Erro:</strong> Lista todas as linhas que não seguem o layout R2D2. Os campos problemáticos são destacados em vermelho.</li>
                                                <li><strong>Linhas Válidas:</strong> Mostra todas as linhas que foram validadas com sucesso.</li>
                                                <li><strong>Arquivo Original:</strong> Exibe o conteúdo completo do arquivo que você enviou.</li>
                                            </ul>
                                        </section>
                                        <section>
                                            <h3 className="font-semibold text-base mb-2">3. Corrigindo Erros</h3>
                                            <p>Na aba de erros, você tem duas formas de visualizar e corrigir:</p>
                                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                                <li><strong>Visão por Linhas:</strong> Mostra cada linha com erro individualmente.</li>
                                                <li><strong>Agrupar Erros:</strong> Agrupa os erros por tipo (ex: "Campo obrigatório não preenchido"), facilitando a identificação de problemas recorrentes. Expanda um grupo para ver todas as linhas afetadas.</li>
                                                <li><strong>Edição Manual:</strong> Clique no ícone de <Edit className="inline h-4 w-4" /> para tornar uma linha editável. Corrija o conteúdo e clique em "Salvar". O destaque no campo com erro ajuda a identificar o que precisa ser ajustado.</li>
                                            </ul>
                                        </section>
                                        <section>
                                            <h3 className="font-semibold text-base mb-2">4. Baixando o Arquivo Corrigido</h3>
                                            <p>Após fazer as edições manuais, clique no botão <strong>"Corrigir e Baixar"</strong>. Você terá duas opções:</p>
                                             <ul className="list-disc pl-5 mt-2 space-y-1">
                                                <li><strong>Baixar com Correções Manuais:</strong> Gera um novo arquivo contendo apenas as alterações que você fez manualmente.</li>
                                                <li><strong>Usar Correção Automática:</strong> A ferramenta tentará corrigir os erros restantes automaticamente. <strong>Atenção:</strong> Use esta opção com cuidado, pois a correção automática pode não ser perfeita para todos os casos.</li>
                                            </ul>
                                        </section>
                                         <section>
                                            <h3 className="font-semibold text-base mb-2">5. Exportando Relatório de Erros</h3>
                                            <p>Se preferir, você pode exportar um relatório em PDF de todas as linhas com erro clicando em <strong>"Exportar PDF"</strong>. Isso é útil para compartilhar o status do arquivo com outras pessoas.</p>
                                        </section>
                                    </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                           <Button variant="outline" onClick={handleUploadClick}>
                                <UploadCloud className="mr-2"/>
                                Carregar Novo Arquivo
                            </Button>
                            <Button variant="outline" onClick={handleExportPdf} disabled={invalidLines.length === 0}>
                                <FileText className="mr-2"/>
                                Exportar PDF
                            </Button>
                            <Button
                              onClick={handleConfirmCorrection}
                              disabled={results.length === 0 || loading}
                              variant="default"
                            >
                                <Wrench className="mr-2"/>
                                Corrigir e Baixar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                         <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total de Linhas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stats.totalLines}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Linhas Válidas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600 flex items-center">{stats.validLines} <CheckCircle className="ml-2 h-6 w-6"/> </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Linhas com Erro</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600 flex items-center">{stats.invalidLines} <AlertCircle className="ml-2 h-6 w-6"/></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Tipos de Registro</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-bold truncate" title={stats.recordTypes}>{stats.recordTypes}</div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="errors">Linhas com Erro ({stats.invalidLines})</TabsTrigger>
                            <TabsTrigger value="valid">Linhas Válidas ({stats.validLines})</TabsTrigger>
                            <TabsTrigger value="file">Arquivo Original</TabsTrigger>
                        </TabsList>
                        <TabsContent value="errors" className="mt-4">
                            {stats.invalidLines === 0 && !results.some(r => r.isCorrected) ? (
                                <div className="flex flex-col items-center justify-center h-96 text-center p-8 border rounded-md">
                                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold">Nenhum erro encontrado!</h3>
                                    <p className="text-muted-foreground">Todas as linhas foram validadas com sucesso.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                                            <Button variant={errorView === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setErrorView('list')}>
                                                <List className="mr-2 h-4 w-4"/>
                                                Visão por Linhas
                                            </Button>
                                            <Button variant={errorView === 'grouped' ? 'secondary' : 'ghost'} size="sm" onClick={() => setErrorView('grouped')}>
                                                <Group className="mr-2 h-4 w-4" />
                                                Agrupar Erros
                                            </Button>
                                        </div>
                                    </div>

                                    {errorView === 'list' ? (
                                        <SimpleInvalidLinesList 
                                            invalidLines={invalidLines}
                                            onUpdateLine={handleManualLineUpdate}
                                        />
                                    ) : (
                                        <GroupedInvalidLinesList 
                                            invalidLines={invalidLines}
                                            onUpdateLine={handleManualLineUpdate}
                                        />
                                    )}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="valid" className="mt-4">
                             <ScrollArea className="h-96 w-full rounded-md border">
                                <div className="p-4 font-mono text-sm">
                                {validLines.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
                                        <h3 className="text-lg font-semibold">Nenhuma linha válida.</h3>
                                        <p className="text-muted-foreground">Verifique a aba de erros para mais detalhes.</p>
                                    </div>
                                ) : validLines.map((result) => (
                                    <div key={result.lineNumber} className="p-3 border-l-4 rounded-r-md mb-2 bg-green-50/80 border-green-500">
                                        <div className="flex items-center gap-4">
                                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                            <div>Linha {result.lineNumber}: <Badge variant="secondary">{result.recordType || 'N/A'}</Badge></div>
                                        </div>
                                        <div className="font-mono text-xs whitespace-pre-wrap break-all truncate mt-1 ml-9 text-muted-foreground">{result.currentLineContent}</div>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                         <TabsContent value="file" className="mt-4">
                            <ScrollArea className="h-96 w-full rounded-md border">
                                <pre className="p-4 text-sm whitespace-pre-wrap">{fileContent}</pre>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        )}
        <AlertDialog open={isConfirmingCorrection} onOpenChange={setIsConfirmingCorrection}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Corrigir e Baixar Arquivo</AlertDialogTitle>
                    <AlertDialogDescription>
                        Escolha como você deseja gerar o arquivo corrigido. Suas edições manuais serão sempre mantidas.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                    <Button variant="default" className="h-auto" onClick={() => handleProceedWithCorrection(false)}>
                        <div className="flex items-center">
                            <Download className="mr-4 h-5 w-5" />
                            <div className="text-left">
                                <p className="font-semibold">Baixar com Correções Manuais</p>
                                <p className="text-xs text-primary-foreground/80">Salva o arquivo apenas com as alterações que você fez manualmente.</p>
                            </div>
                        </div>
                    </Button>
                    <Button variant="secondary" className="h-auto" onClick={() => handleProceedWithCorrection(true)}>
                         <div className="flex items-center">
                            <Wrench className="mr-4 h-5 w-5" />
                            <div className="text-left">
                                <p className="font-semibold">Usar Correção Automática</p>
                                <p className="text-xs text-secondary-foreground/80">A ferramenta tenta corrigir os erros restantes. Use com atenção.</p>
                            </div>
                        </div>
                    </Button>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
