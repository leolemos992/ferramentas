"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { patchNotes, type PatchNote } from "@/lib/patchnotes";
import { BookText } from "lucide-react";
import { Separator } from "./ui/separator";

export function PatchNotes() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-muted-foreground">
          <BookText className="mr-2 h-4 w-4" />
          Patch Notes
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Histórico de Versões</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)] pr-4 mt-4">
          <div className="space-y-6">
            {patchNotes.map((note: PatchNote) => (
              <div key={note.version}>
                <div className="flex items-center gap-4">
                  <Badge>{note.version}</Badge>
                  <p className="text-sm text-muted-foreground">{new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                </div>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                  {note.changes.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
                {patchNotes.indexOf(note) < patchNotes.length - 1 && <Separator className="mt-6"/>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
