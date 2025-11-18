
"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, X, Loader2, CodeXml, ChevronRight, ChevronDown, FileText, Copy, ClipboardPaste } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type XmlNode = {
  tagName: string;
  attributes: { [key: string]: string };
  children: (XmlNode | string)[];
  isSelfClosing: boolean;
};

const parseXml = (xmlString: string): XmlNode | null => {
  if (!xmlString.trim()) {
    return null;
  }
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

const serializeNode = (node: XmlNode, indent = ''): string => {
  const attributes = Object.entries(node.attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  const attributeString = attributes ? ' ' + attributes : '';

  if (node.isSelfClosing) {
    return `${indent}<${node.tagName}${attributeString} />`;
  }

  if (node.children.length === 0) {
    return `${indent}<${node.tagName}${attributeString}></${node.tagName}>`;
  }
  
  if (node.children.length === 1 && typeof node.children[0] === 'string') {
    return `${indent}<${node.tagName}${attributeString}>${node.children[0]}</${node.tagName}>`;
  }
  
  const childrenString = node.children
    .map(child => typeof child === 'string' 
      ? `${indent}  ${child}` 
      : serializeNode(child, indent + '  '))
    .join('\n');
    
  return `${indent}<${node.tagName}${attributeString}>\n${childrenString}\n${indent}</${node.tagName}>`;
};

const XmlNodeViewer: React.FC<{ node: XmlNode | string, defaultOpen?: boolean }> = ({ node, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { toast } = useToast();

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copiado!', description: message });
    }).catch(err => {
      toast({ variant: 'destructive', title: 'Erro ao copiar', description: err.message });
    });
  };

  if (typeof node === 'string') {
    return (
      <div className="group flex items-center gap-2 pl-6 py-1 text-sm text-amber-700 dark:text-amber-300 italic">
        {`"${node}"`}
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleCopy(node, 'Conteúdo de texto copiado.')}>
            <Copy className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
      </div>
    );
  }

  const hasChildren = node.children.length > 0;

  return (
    <div className="text-sm group">
      <div 
        className={cn("flex items-center gap-1 py-1 px-2 rounded hover:bg-muted", hasChildren && "cursor-pointer")}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />
        ) : (
            <span className="w-4"></span>
        )}
        <span className="text-blue-600 dark:text-blue-400">{`<${node.tagName}`}</span>
        {Object.entries(node.attributes).map(([key, value]) => (
          <span key={key} className="text-red-500 dark:text-red-400 group/attr relative">
            {' '}{key}=<span className="text-green-600 dark:text-green-400">{`"${value}"`}</span>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover/attr:opacity-100" onClick={(e) => { e.stopPropagation(); handleCopy(value, `Valor do atributo '${key}' copiado.`);}}>
                    <Copy className="h-3 w-3" />
                </Button>
            </TooltipTrigger>
          </span>
        ))}
        {node.isSelfClosing ? (
            <span className="text-blue-600 dark:text-blue-400">{` />`}</span>
        ) : (
            <span className="text-blue-600 dark:text-blue-400">{`>`}</span>
        )}
        {!hasChildren && !node.isSelfClosing && <span className="text-blue-600 dark:text-blue-400">{`</${node.tagName}>`}</span>}
        
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleCopy(serializeNode(node), `Nó <${node.tagName}> copiado como XML.`); }}>
                <CodeXml className="h-3 w-3" />
            </Button>
        </TooltipTrigger>
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
  const [xmlContent, setXmlContent] = useState('');
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
      setXmlContent('');
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
    setXmlContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleParseString = (content: string) => {
    setLoading(true);
    setFile(null);
    try {
        const parsedTree = parseXml(content);
        setXmlTree(parsedTree);
        if (parsedTree) {
            toast({
                title: "XML Carregado",
                description: "A estrutura do XML foi analisada com sucesso.",
              });
        } else {
            toast({
                variant: 'destructive',
                title: "XML Vazio",
                description: "O conteúdo XML está vazio ou inválido.",
              });
        }
    } catch (error: any) {
        setXmlTree(null);
        toast({
          variant: "destructive",
          title: "Erro ao processar XML",
          description: error.message || "Não foi possível ler o conteúdo do XML.",
        });
    } finally {
        setLoading(false);
    }
  }

  const handleParseFile = (fileToParse: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setXmlContent(content);
      handleParseString(content);
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
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CodeXml />
            Analisador de Estrutura XML
          </CardTitle>
          <CardDescription>
            Cole o conteúdo de um XML ou faça o upload de um arquivo para visualizar sua estrutura em árvore.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Label htmlFor="xml-input">Colar XML</Label>
                    <Textarea 
                        id="xml-input"
                        placeholder='Cole seu código XML aqui...'
                        value={xmlContent}
                        onChange={(e) => setXmlContent(e.target.value)}
                        className="h-48 font-mono text-xs"
                        disabled={loading}
                    />
                     <div className="flex gap-2">
                        <Button onClick={() => handleParseString(xmlContent)} disabled={loading || !xmlContent}>
                            {loading ? <Loader2 className="animate-spin"/> : <ClipboardPaste />}
                            Analisar Conteúdo
                        </Button>
                     </div>
                </div>
                 <div className="space-y-4 flex flex-col items-center justify-center">
                    <p className="text-muted-foreground text-sm">ou</p>
                     <Label htmlFor="file-upload" className={cn(
                        "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors",
                        {"pointer-events-none opacity-50": loading}
                      )}>
                         <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">
                                Clique para fazer upload
                            </span>
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
                        disabled={loading}
                    />
                </div>
           </div>

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 mt-6">
              <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
              <p className="text-lg text-muted-foreground">Analisando XML...</p>
            </div>
          )}
          
          {(file || xmlContent) && !loading && (
            <div className="mt-6 space-y-4">
                {file && (
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
                )}
            </div>
          )}

          {xmlTree && !loading && (
                <Card className='mt-6'>
                    <CardHeader>
                        <CardTitle>Estrutura do XML</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TooltipProvider>
                            <ScrollArea className="h-[60vh] p-4 border rounded-md font-mono">
                            <XmlNodeViewer node={xmlTree} defaultOpen={true} />
                            </ScrollArea>
                        </TooltipProvider>
                    </CardContent>
                </Card>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    