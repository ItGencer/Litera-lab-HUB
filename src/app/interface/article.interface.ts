export interface Article {
  id: string;
  title: string;
  description: string;
  authorUid: string;
  author: string; // ім'я автора (необов'язково)
  date?: string;
  category?: string;
}