import { FileText, FileArchive, Film } from "lucide-react";
import type { ComponentType } from "react";

export const materialIcon: Record<string, ComponentType<{ className?: string }>> = {
  description: FileText,
  folder_zip: FileArchive,
  movie: Film,
};
