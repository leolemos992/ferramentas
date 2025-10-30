"use client";

import { useState, useRef, type ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle, AlertCircle, UploadCloud } from "lucide-react";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

type ValidationRules = {
  [key: string]: number;
};

const validationRules: ValidationRules = {
  OP: 34,
  IT: 22,
  PG: 14,
  RC: 10,
  CO: 10,
  XL: 2,
  INT: 5,
  RZ: 13,
  TP: 5,
  CL: 64,
  PR: 93,
  VR: 6,
  PB: 4,
  PS: 3,
  NCM: 9,
  EM: 7,
  ES: 8,
  DV: 27,
  ID: 14,
  US: 7,
  CP: 5,
};

export function FileValidator() {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const isTxt = selectedFile.name.toLowerCase().endsWith(".txt");
    const isCsv = selectedFile.name.toLowerCase().endsWith(".csv");

    if (isTxt || isCsv) {
      setFile(selectedFile);
      setIsValid(null);
      setErrors([]);
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
    setIsValid(null);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleValidate = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split(/\r?\n/);
      const validationErrors: string[] = [];

      lines.forEach((line, index) => {
        if (line.trim() === "") return;

        const fields = line.split(";");
        const recordType = fields[0];
        const lineNumber = index + 1;

        if (recordType in validationRules) {
          const expectedFields = validationRules[recordType];
          // The number of fields should be one more than the max position because position is 1-based
          if (fields.length !== expectedFields) {
            validationErrors.push(
              `Linha ${lineNumber}: O registro '${recordType}' deve ter ${expectedFields} campos, mas tem ${fields.length}.`
            );
          }
        } else {
          validationErrors.push(
            `Linha ${lineNumber}: Tipo de registro desconhecido '${recordType}'.`
          );
        }
      });

      setErrors(validationErrors);
      setIsValid(validationErrors.length === 0);
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Validador de Arquivos R2D2
        </CardTitle>
        <CardDescription>
          Faça o upload de um arquivo de importação (.txt ou .csv) para validar
          sua estrutura.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label
            htmlFor="file-upload"
            className={cn(
              "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors"
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
          />

          {file && (
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
          disabled={!file}
          className="w-full text-lg py-6"
        >
          Validar Arquivo
        </Button>

        {isValid !== null && (
          <div className="animate-in fade-in-50 duration-500">
            {isValid ? (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Arquivo Válido!</AlertTitle>
                <AlertDescription>
                  A estrutura do arquivo parece estar correta.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erros Encontrados</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 list-disc list-inside space-y-1 max-h-60 overflow-y-auto font-mono text-xs">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
