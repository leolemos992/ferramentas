
"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, X, Loader2, CodeXml, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

type XmlNode = {
  tagName: string;
  attributes: { [key: string]: string };
  children: (XmlNode | string)[];
  isSelfClosing: boolean;
};

const parseXml = (xmlString: string): XmlNode => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Erro de parse do XML: ${parseError.textContent}`);
  }

  const convertNode = (node: Element): XmlNode | string => {
    const result: XmlNode = {
      tagName: node.tagName,
      attributes: {},
      children: [],
      isSelfClosing: node.children.length === 0 && !node.textContent?.trim(),
    };

    for (const attr of Array.from(node.attributes)) {
      result.attributes[attr.name] = attr.value;
    }

    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        result.children.push(convertNode(child as Element) as XmlNode);
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        result.children.push(child.textContent.trim());
      }
    }
    return result;
  };
  return convertNode(doc.documentElement) as XmlNode;
};

const XmlNodeViewer: React.FC<{ node: XmlNode | string, defaultOpen?: boolean }> = ({ node, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (typeof node === 'string') {
    return (
      <div className="pl-6 py-1 text-sm text-amber-700 dark:text-amber-300 italic">
        {`"${node}"`}
      </div>
    );
  }

  const hasChildren = node.children.length > 0;

  return (
    <div className="text-sm">
      <div 
        className={cn("flex items-center gap-1 cursor-pointer py-1 px-2 rounded hover:bg-muted", hasChildren && "cursor-pointer")}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />
        ) : (
            <span className="w-4"></span>
        )}
        <span className="text-blue-600 dark:text-blue-400">{`<${node.tagName}`}</span>
        {Object.entries(node.attributes).map(([key, value]) => (
          <span key={key} className="text-red-500 dark:text-red-400">
            {' '}{key}=<span className="text-green-600 dark:text-green-400">{`"${value}"`}</span>
          </span>
        ))}
        {node.isSelfClosing ? (
            <span className="text-blue-600 dark:text-blue-400">{` />`}</span>
        ) : (
            <span className="text-blue-600 dark:text-blue-400">{`>`}</span>
        )}
        {!hasChildren && !node.isSelfClosing && <span className="text-blue-600 dark:text-blue-400">{`</${node.tagName}>`}</span>}
      </div>
      
      {isOpen && hasChildren && (
        <div className="pl-6 border-l border-dashed ml-4">
          {node.children.map((child, index) => (
            <XmlNodeViewer key={index} node={child} defaultOpen={false} />
          ))}
          <div className="flex items-center gap-1 py-1 px-2 text-blue-600 dark:text-blue-400">
            <span className="w-4"></span>
            {`</${node.tagName}>`}
          </div>
        </div>
      )}
    </div>
  );
};


export function XmlAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [xmlTree, setXmlTree] = useState<XmlNode | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type === "text/xml" || selectedFile.name.endsWith('.xml')) {
      setFile(selectedFile);
      setXmlTree(null);
      handleParseFile(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione um arquivo .xml.",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setXmlTree(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleParseFile = (fileToParse: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedTree = parseXml(content);
        setXmlTree(parsedTree);
        toast({
          title: "XML Carregado",
          description: "A estrutura do arquivo foi carregada com sucesso.",
        });
      } catch (error: any) {
        setXmlTree(null);
        toast({
          variant: "destructive",
          title: "Erro ao processar XML",
          description: error.message || "Não foi possível ler o conteúdo do arquivo XML.",
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
    };

    reader.readAsText(fileToParse);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CodeXml />
            Analisador de Estrutura XML
          </CardTitle>
          <CardDescription>
            Faça o upload de um arquivo XML para visualizar sua estrutura em formato de árvore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[20rem] text-center">
              <Label
                htmlFor="file-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full max-w-lg h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors",
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
                    <p className="text-xs text-muted-foreground">Arquivo .XML</p>
                  </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xml,text/xml"
                className="sr-only"
              />
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
              <p className="text-lg text-muted-foreground">Analisando XML...</p>
            </div>
          )}

          {file && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                  <div className="flex items-center gap-2 text-sm font-medium text-secondary-foreground truncate">
                    <FileText />
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

              {xmlTree && (
                <Card>
                    <CardHeader>
                        <CardTitle>Estrutura do XML</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[60vh] p-4 border rounded-md font-mono">
                          <XmlNodeViewer node={xmlTree} defaultOpen={true} />
                        </ScrollArea>
                    </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
