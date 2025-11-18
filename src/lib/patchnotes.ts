import data from './patchnotes.json';

export type PatchNote = {
  version: string;
  date: string;
  changes: string[];
};

export const patchNotes: PatchNote[] = data.notes;
