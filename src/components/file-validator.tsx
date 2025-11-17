
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
import { X, CheckCircle, AlertCircle, UploadCloud, FileCheck, Trash2, Loader2, Wrench, ChevronDown, Download, FileText } from "lucide-react";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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

type LineResult = {
  lineNumber: number;
  lineContent: string;
  recordType?: string;
  errors: { message: string; columnIndex: number }[];
};

type Suggestion = {
    lineNumber: number;
    suggestedLine: string;
}

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


function InvalidLinesList({ invalidLines }: { invalidLines: LineResult[] }) {

  const getHighlightedLine = (result: LineResult) => {
    const fields = result.lineContent.split(';');
    const errorColumns = result.errors.map(e => e.columnIndex);
  
    return (
      <div className="font-mono text-xs whitespace-pre-wrap break-all">
        {fields.map((field, index) => (
            <span key={index} className={cn(errorColumns.includes(index) ? "bg-red-200 text-red-900 rounded-sm p-0.5" : "")}>
              {field}{index < fields.length - 1 && <span className="text-gray-400 mx-px">;</span>}
            </span>
          )
        )}
      </div>
    );
  };

  return (
      <ScrollArea className="h-96 w-full rounded-md border">
          <div className="p-4">
              {invalidLines.map((result) => {
                  return (
                      <div
                          key={result.lineNumber}
                          className="p-3 border-b mb-2 bg-secondary/30 rounded-lg"
                      >
                          <div className="flex items-start justify-between gap-4">
                             <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                      <div className="font-semibold text-sm">Linha {result.lineNumber}:</div>
                                      <Badge variant="destructive">{result.recordType || 'N/A'}</Badge>
                                  </div>
                                   <div className="mt-1 p-2 bg-secondary/50 rounded-md border text-xs font-mono">
                                      {getHighlightedLine(result)}
                                  </div>
                             </div>
                          </div>
                          <div className="mt-2 pl-1">
                              <h4 className="font-semibold text-sm mb-1 text-red-800">Erros Encontrados:</h4>
                              <ul className="space-y-1 list-disc pl-5">
                                  {result.errors.map((error, index) => {
                                      const fieldRule = result.recordType ? validationRules[result.recordType]?.fields[error.columnIndex] : null;
                                      const fieldName = fieldRule ? fieldRule.name : 'Geral';
                                      return (
                                          <li key={index} className="text-red-700 text-xs font-sans">
                                              <b>{fieldName} (Campo {error.columnIndex + 1}):</b> {error.message}
                                          </li>
                                      )
                                  })}
                              </ul>
                          </div>
                      </div>
                  );
              })}
          </div>
      </ScrollArea>
  );
}


export function FileValidator() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LineResult[]>([]);
  const [fileContent, setFileContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("errors");
  const [isConfirmingCorrection, setIsConfirmingCorrection] = useState(false);


  const handleFileDrop = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    const isTxt = selectedFile.name.toLowerCase().endsWith(".txt");
    const isCsv = selectedFile.name.toLowerCase().endsWith(".csv");

    if (isTxt || isCsv) {
      setFile(selectedFile);
      setResults([]);
      setFileContent("");
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
    setFileContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateLine = (line: string, lineNumber: number): LineResult => {
    const lineErrors: LineResult['errors'] = [];
    const fields = line.split(";");
    const recordType = fields[0]?.trim();

    if (!recordType && line.trim() === '') {
        return { lineNumber, lineContent: line, errors: [] }; // Ignore empty lines
    }

    const rule = validationRules[recordType];
    if (!rule) {
        lineErrors.push({ message: `Tipo de registro desconhecido '${recordType}'.`, columnIndex: 0 });
    } else {
        if (fields.length !== rule.fieldCount) {
            lineErrors.push({
                message: `O registro '${recordType}' deve ter ${rule.fieldCount} campos, mas foram encontrados ${fields.length}.`,
                columnIndex: -1 // General line error
            });
        }

        rule.fields.forEach((fieldRule, index) => {
            if (index >= fields.length) return; // Don't validate fields that don't exist due to wrong field count
            const fieldValue = fields[index]?.trim();

            if (fieldRule.required && !fieldValue) {
                lineErrors.push({ message: `Campo obrigatório não preenchido.`, columnIndex: index });
            }

            if (fieldValue) {
                if (fieldRule.maxLength !== Infinity && fieldValue.length > fieldRule.maxLength) {
                    lineErrors.push({ message: `Excede o tamanho máximo de ${fieldRule.maxLength} (atual: ${fieldValue.length}).`, columnIndex: index });
                }
                
                if (fieldRule.type === 'N') {
                    if (!/^-?\d*[,.]?\d*$/.test(fieldValue.replace(/\./g, ''))) { // Allow dot for thousands and comma for decimal
                        lineErrors.push({ message: `Deve ser um valor numérico.`, columnIndex: index });
                    } else if (fieldRule.decimals !== undefined) {
                        const parts = fieldValue.split(',');
                        if (parts[1] && parts[1].length > fieldRule.decimals) {
                           lineErrors.push({ message: `Deve ter no máximo ${fieldRule.decimals} casas decimais.`, columnIndex: index });
                        }
                    }
                } else if (fieldRule.type === 'D' && !/^\d{8}$/.test(fieldValue)) {
                    lineErrors.push({ message: `Deve estar no formato de data AAAAMMDD.`, columnIndex: index });
                } else if (fieldRule.type === 'T' && !/^\d{14}$/.test(fieldValue)) {
                    lineErrors.push({ message: `Deve estar no formato de data/hora AAAAMMDDHHMMSS.`, columnIndex: index });
                }
            }
        });
    }

    return { lineNumber, lineContent: line, recordType, errors: lineErrors };
  };

  const handleValidate = () => {
    if (!file) return;
    setLoading(true);
    setResults([]);
    setFileContent("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
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
    reader.readAsText(file, "latin1");
  };
  
  const correctLine = (lineResult: LineResult): string => {
    if (lineResult.errors.length === 0) return lineResult.lineContent;
    
    const { recordType } = lineResult;
    const rule = recordType ? validationRules[recordType] : undefined;

    if (!rule) return lineResult.lineContent; // Cannot correct without rules

    let fields = lineResult.lineContent.split(';');

    // Rule 1: Field count
    if (fields.length < rule.fieldCount) {
        fields = [...fields, ...Array(rule.fieldCount - fields.length).fill('')];
    } else if (fields.length > rule.fieldCount) {
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
  
  const handleProceedWithCorrection = () => {
    if (invalidLines.length === 0) {
        toast({ title: "Nenhum erro a corrigir", description: "O arquivo já está válido." });
        setIsConfirmingCorrection(false);
        return;
    }

    const originalLines = fileContent.split(/\r?\n/);
    const correctedLines = originalLines.map((line, index) => {
        const lineResult = results.find(r => r.lineNumber === index + 1);
        if (lineResult && lineResult.errors.length > 0) {
            return correctLine(lineResult);
        }
        return line;
    });

    const correctedContent = correctedLines.join('\n');
    const blob = new Blob([correctedContent], { type: 'text/plain;charset=latin1' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalFileName = file?.name.replace(/\.[^/.]+$/, "") || "arquivo";
    a.download = `${originalFileName}_corrigido.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Arquivo Corrigido", description: "O download do arquivo corrigido foi iniciado." });
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
  
    const tableData = invalidLines.map(line => ({
      line,
      body: [
        line.lineNumber,
        line.recordType || 'N/A',
        line.lineContent,
        line.errors.map(e => {
          const fieldName = line.recordType && e.columnIndex >= 0 ? validationRules[line.recordType]?.fields[e.columnIndex]?.name : 'Geral';
          return `${fieldName} (Campo ${e.columnIndex + 1}): ${e.message}`;
        }).join('\n')
      ]
    }));
  
    autoTable(doc, {
      startY: 45,
      head: [['Linha', 'Tipo', 'Conteúdo da Linha', 'Erros Encontrados']],
      body: tableData.map(d => d.body),
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [34, 197, 94], // green-500
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 15 },
        2: { cellWidth: 120 },
        3: { cellWidth: 'auto' },
      },
      didDrawCell: (data) => {
        // Highlight content for 'Conteúdo da Linha' column
        if (data.column.index === 2 && data.row.section === 'body') {
          const lineResult = invalidLines[data.row.index];
          if (!lineResult) return;
          const fields = lineResult.lineContent.split(';');
          const errorColumns = lineResult.errors.map(e => e.columnIndex);
          const cell = data.cell;
          
          let currentX = cell.x + cell.padding('left');
          const currentY = cell.y + cell.padding('top');
          
          doc.setFontSize(data.cell.styles.fontSize || 8);
          doc.setFont(data.cell.styles.font || 'helvetica', data.cell.styles.fontStyle || 'normal');
  
          fields.forEach((field, index) => {
            const isError = errorColumns.includes(index);
            const text = field + (index < fields.length - 1 ? ';' : '');
            const textWidth = doc.getStringUnitWidth(text) * (doc.getFontSize() / doc.internal.scaleFactor);
  
            if (isError) {
              doc.setFillColor(254, 226, 226); // red-100
              doc.rect(currentX, cell.y, textWidth, cell.height, 'F');
              doc.setTextColor(153, 27, 27); // red-800
            } else {
              doc.setTextColor(41, 37, 36); // neutral-800
            }
            
            doc.text(text, currentX, currentY);
            currentX += textWidth;
          });
          doc.setTextColor(0, 0, 0); // Reset text color
        }
      },
    });
  
    const originalFileName = file.name.replace(/\.[^/.]+$/, "") || "arquivo";
    doc.save(`relatorio_erros_${originalFileName}.pdf`);
  
    toast({
        title: "Relatório PDF Gerado",
        description: "O download do seu relatório de erros foi iniciado.",
    });
  }


  const { validLines, invalidLines } = useMemo(() => {
    const validLines = results.filter(r => r.lineContent.trim() !== '' && r.errors.length === 0);
    const invalidLines = results.filter(r => r.errors.length > 0);
    return { validLines, invalidLines };
  }, [results]);

  const stats = useMemo(() => {
    const totalLines = results.filter(r => r.lineContent.trim() !== '').length;
    const recordTypes = [...new Set(results.map(r => r.recordType).filter(Boolean))];
    const recordTypeNamesFound = recordTypes.map(rt => recordTypeNames[rt!] || rt).join(', ');

    return { 
        totalLines, 
        validLines: validLines.length, 
        invalidLines: invalidLines.length,
        recordTypes: recordTypeNamesFound || 'Nenhum'
    };
  }, [results, validLines, invalidLines]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">
                Validador R2D2
                </CardTitle>
                <CardDescription>
                Faça o upload de um arquivo de importação (.txt ou .csv) para validar
                sua estrutura.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                <Label
                    htmlFor="file-upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors",
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

                {file && !loading && (
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-md animate-in fade-in-50">
                    <div className="text-sm font-medium text-secondary-foreground truncate">
                        {file.name}
                    </div>
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
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <Button
                        onClick={handleValidate}
                        disabled={!file || loading}
                        className="w-full text-lg py-6"
                    >
                    {loading ? <Loader2 className="animate-spin" /> : <FileCheck />}
                    Validar Arquivo
                    </Button>
                     <Button
                        onClick={handleConfirmCorrection}
                        disabled={invalidLines.length === 0 || loading}
                        className="w-full text-lg py-6"
                        variant="outline"
                    >
                        <Wrench className="mr-2"/>
                        Corrigir e Baixar
                    </Button>
                </div>
            </CardContent>
        </Card>

        {results.length > 0 && !loading && (
            <Card className="animate-in fade-in-50 duration-500">
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>Resultado da Validação</CardTitle>
                            <CardDescription>Arquivo: {file?.name}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleExportPdf} disabled={invalidLines.length === 0}>
                                <FileText className="mr-2"/>
                                Exportar PDF
                            </Button>
                            <Button variant="outline" onClick={handleRemoveFile}>
                                <Trash2 className="mr-2"/> Limpar Resultados
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
                            <TabsTrigger value="errors">Linhas com Erro ({invalidLines.length})</TabsTrigger>
                            <TabsTrigger value="valid">Linhas Válidas ({validLines.length})</TabsTrigger>
                            <TabsTrigger value="file">Arquivo</TabsTrigger>
                        </TabsList>
                        <TabsContent value="errors" className="mt-4">
                            {invalidLines.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-96 text-center p-8 border rounded-md">
                                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold">Nenhum erro encontrado!</h3>
                                    <p className="text-muted-foreground">Todas as linhas foram validadas com sucesso.</p>
                                </div>
                            ) : (
                                <InvalidLinesList 
                                    invalidLines={invalidLines}
                                />
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
                                        <div className="font-mono text-xs whitespace-pre-wrap break-all truncate mt-1 ml-9 text-muted-foreground">{result.lineContent}</div>
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
                <AlertDialogTitle>Confirmar Correção e Download</AlertDialogTitle>
                <AlertDialogDescription>
                    {`Você está prestes a corrigir um arquivo com ${invalidLines.length} linha(s) com erro. A ferramenta tentará aplicar as seguintes correções:`}
                    <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                        <li>Ajustará o número de campos (colunas) para o esperado.</li>
                        <li>Removerá caracteres excedentes em campos com tamanho máximo.</li>
                        <li>Corrigirá a formatação de campos numéricos (casas decimais).</li>
                        <li>Preencherá campos obrigatórios vazios com valores padrão.</li>
                    </ul>
                    <p className="mt-2">Um novo arquivo chamado <code className="bg-muted px-1 py-0.5 rounded text-foreground">{`${file?.name.replace(/\.[^/.]+$/, "") || "arquivo"}_corrigido.txt`}</code> será baixado. Deseja continuar?</p>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleProceedWithCorrection}>
                    <Download className="mr-2 h-4 w-4" />
                    Continuar e Baixar
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

    