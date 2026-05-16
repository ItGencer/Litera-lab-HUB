import { inject, Injectable, signal } from '@angular/core';
import { Database, ref, push, update, remove, onValue } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';

export interface NewsItem {
  id?: string;
  title: string;
  text: string;
  imageUrl?: string;
  author: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private db = inject(Database);
  private auth = inject(Auth);

  news = signal<NewsItem[]>([]);
  isLoading = signal(false);

  loadAll(): void {
    this.isLoading.set(true);
    onValue(ref(this.db, 'News'), (snap) => {
      if (!snap.exists()) {
        this.news.set([]);
        this.isLoading.set(false);
        return;
      }
      // ✅ ВИПРАВЛЕННЯ: те саме
      const list: NewsItem[] = [];
      snap.forEach((child) => {
        list.push({ id: child.key!, ...child.val() });
      });
      this.news.set(list.reverse());
      this.isLoading.set(false);
    });
  }

  async save(item: Omit<NewsItem, 'id' | 'createdAt' | 'author'>): Promise<void> {
    const u = this.auth.currentUser;
    await push(ref(this.db, 'News'), {
      ...item,
      author: u?.email ?? 'unknown',
      createdAt: Date.now(),
    });
  }

  async update(id: string, data: Partial<Omit<NewsItem, 'id'>>): Promise<void> {
    await update(ref(this.db, `News/${id}`), data);
  }

  async delete(id: string): Promise<void> {
    await remove(ref(this.db, `News/${id}`));
  }
}
