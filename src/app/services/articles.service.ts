import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Article } from '../interface/article.interface';
import { DbReadService } from './db/db-read.service';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private db = inject(DbReadService);

  getNews(): Observable<Article[]> {
    // DbReadService.get<T>(path) → автоматично додає .json та auth токен
    return this.db.get<Record<string, Article>>('News').pipe(
      map(data => {
        if (!data) return [];
        // Firebase повертає об'єкт { key: Article }
        // Object.entries → [[id, article], ...] → масив
        return Object.entries(data).map(([id, article]) => ({
          ...article,
          id
        }));
      })
    );
  }
}