export interface WorkPart {
  title: string;
  content: string;
}

export interface Work {
  id?: string;
  title: string;
  author: string;
  genre: string;
  type: string;
  year: number | null;
  description: string[];
  parts: WorkPart[];
  createdAt: number;
  createdBy: string;
}

export interface WorkType {
  genres: string[];
  types: string[];
  about_max?: number;
  desc_max: number;
}
