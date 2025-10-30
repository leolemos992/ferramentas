
"use client";

import { useState, useRef, type ChangeEvent, useMemo } from "react";
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
import { X, CheckCircle, AlertCircle, UploadCloud, FileCheck, Trash2, Loader2 } from "lucide-react";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

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
  errors: string[];
};

export function FileValidator() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LineResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const isTxt = selectedFile.name.toLowerCase().endsWith(".txt");
    const isCsv = selectedFile.name.toLowerCase().endsWith(".csv");

    if (isTxt || isCsv) {
      setFile(selectedFile);
      setResults([]);
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

  const handleRemoveFile = () => {
    setFile(null);
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateLine = (line: string, lineNumber: number): LineResult => {
    const lineErrors: string[] = [];
    const fields = line.split(";");
    const recordType = fields[0]?.trim();

    if (!recordType) {
        return { lineNumber, lineContent: line, errors: [] }; // Ignore empty lines
    }

    const rule = validationRules[recordType];
    if (!rule) {
        lineErrors.push(`Coluna 1: Tipo de registro desconhecido '${recordType}'.`);
    } else {
        if (fields.length !== rule.fieldCount) {
            lineErrors.push(
            `O registro '${recordType}' deve ter ${rule.fieldCount} campos, mas foram encontrados ${fields.length}.`
            );
        }

        rule.fields.forEach((fieldRule, index) => {
            const fieldValue = fields[index]?.trim();

            if (fieldRule.required && !fieldValue) {
                lineErrors.push(`Coluna ${index + 1}: Campo "${fieldRule.name}" é obrigatório e não foi preenchido.`);
            }

            if (fieldValue) {
                if (fieldValue.length > fieldRule.maxLength) {
                    lineErrors.push(`Coluna ${index + 1}: Campo "${fieldRule.name}" excede o tamanho máximo de ${fieldRule.maxLength} caracteres.`);
                }
                
                if (fieldRule.type === 'N') {
                    const decimalPattern = fieldRule.decimals ? `^\\d*(\\.\\d{1,${fieldRule.decimals}})?$` : '^\\d*$';
                    if (!new RegExp(decimalPattern).test(fieldValue)) {
                       lineErrors.push(`Coluna ${index + 1}: Campo "${fieldRule.name}" deve ser um número${fieldRule.decimals ? ` com até ${fieldRule.decimals} casas decimais` : ''}.`);
                    }
                } else if (fieldRule.type === 'D' && !/^\d{8}$/.test(fieldValue)) {
                    lineErrors.push(`Coluna ${index + 1}: Campo "${fieldRule.name}" deve estar no formato de data AAAAMMDD.`);
                } else if (fieldRule.type === 'T' && !/^\d{14}$/.test(fieldValue)) {
                    lineErrors.push(`Coluna ${index + 1}: Campo "${fieldRule.name}" deve estar no formato de data/hora AAAAMMDDHHMMSS.`);
                }
            }
        });
    }

    return { lineNumber, lineContent: line, recordType, errors: lineErrors };
  };

  const handleValidate = () => {
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split(/\r?\n/);
      const validationResults = lines.map((line, index) => validateLine(line, index + 1));
      
      setResults(validationResults);
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
    reader.readAsText(file);
  };
  
  const stats = useMemo(() => {
    const totalLines = results.filter(r => r.lineContent.trim() !== '').length;
    const invalidLines = results.filter(r => r.errors.length > 0).length;
    const validLines = totalLines - invalidLines;
    return { totalLines, validLines, invalidLines };
  }, [results]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
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
                </div>

                <Button
                    onClick={handleValidate}
                    disabled={!file || loading}
                    className="w-full text-lg py-6 mt-6"
                >
                {loading ? <Loader2 className="animate-spin" /> : <FileCheck />}
                Validar Arquivo
                </Button>
            </CardContent>
        </Card>

        {results.length > 0 && (
            <Card className="animate-in fade-in-50 duration-500">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Resultado da Validação</CardTitle>
                        <CardDescription>Arquivo: {file?.name}</CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleRemoveFile}><Trash2 className="mr-2"/> Limpar Resultados</Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                                <p className="text-3xl font-bold text-green-600 flex items-center">{stats.validLines} <CheckCircle className="ml-2 h-6 w-6"/> </p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Linhas Inválidas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-red-600 flex items-center">{stats.invalidLines} <AlertCircle className="ml-2 h-6 w-6"/></p>
                            </CardContent>
                        </Card>
                    </div>
                    <h3 className="text-lg font-semibold mb-4">Detalhes</h3>
                     <ScrollArea className="h-96 w-full rounded-md border">
                        <div className="p-4 font-mono text-sm">
                        {results.filter(r => r.lineContent.trim() !== '').map((result) => (
                            <div key={result.lineNumber} className={cn("p-3 border-l-4 rounded-r-md mb-2", result.errors.length > 0 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500')}>
                                <div className="flex items-center gap-4">
                                   {result.errors.length > 0 ? <AlertCircle className="h-5 w-5 text-red-500 shrink-0" /> : <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
                                    <p className="font-semibold">Linha {result.lineNumber}: <Badge variant="secondary">{result.recordType || 'N/A'}</Badge></p>
                                </div>
                                <p className="truncate mt-1 ml-9 text-muted-foreground">{result.lineContent}</p>
                                {result.errors.length > 0 && (
                                    <div className="mt-2 ml-9 space-y-1">
                                        {result.errors.map((error, index) => (
                                            <p key={index} className="text-red-700 text-xs">{error}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

    