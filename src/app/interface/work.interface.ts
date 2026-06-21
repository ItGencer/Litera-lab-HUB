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
  year: string | null; // дата 'yyyy-MM-dd' (раніше — просто число-рік)
  description: string[];
  hasParts: boolean; // визначається автоматично за полем `type`, див. works.service.ts
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