import { inject, Injectable, signal } from '@angular/core';
import { Database, ref, get, set, update, remove, push, onValue } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';
import { Work } from '../interface/work.interface';

export const GENRES = ['Лірика', 'Епос', 'Драма', 'Лірично-епічний'];
export const WORK_TYPES = [
  'Вірш',
  'Поема',
  'Роман',
  'Повість',
  'Оповідання',
  "П'єса",
  'Трагедія',
  'Комедія',
  'Елегія',
  'Ода',
  'Байка',
];

@Injectable({ providedIn: 'root' })
export class WorksService {
  private db = inject(Database);
  private auth = inject(Auth);
  private isLoading = signal(false);

  public works = signal<Work[]>([]);

  loadAll(): void {
    this.isLoading.set(true);
    onValue(ref(this.db, 'Works'), (snap) => {
      if (!snap.exists()) {
        this.works.set([]);
        this.isLoading.set(false);
        return;
      }
      const list: Work[] = [];
      snap.forEach((child) => {
        list.push({ id: child.key!, ...child.val() });
      });
      this.works.set(list);
      this.isLoading.set(false);
    });
  }

  async save(work: Omit<Work, 'id' | 'createdAt' | 'createdBy'>): Promise<void> {
    const uid = this.auth.currentUser?.uid ?? 'unknown';
    await push(ref(this.db, 'Works'), {
      ...work,
      description: this.splitToChunks(work.description.join(''), 1000),
      createdAt: Date.now(),
      createdBy: uid,
    });
  }
  splitToChunks(text: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks.length ? chunks : [''];
  }

  async update(id: string, data: Partial<Omit<Work, 'id'>>): Promise<void> {
    if (data.description) {
      data = { ...data, description: this.splitToChunks(data.description.join(''), 1000) };
    }
    await update(ref(this.db, `Works/${id}`), data);
  }

  async delete(id: string): Promise<void> {
    await remove(ref(this.db, `Works/${id}`));
  }
}
