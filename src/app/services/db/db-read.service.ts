import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { from, Observable, switchMap } from 'rxjs';
import { dbUrl } from './db.config';

@Injectable({ providedIn: 'root' })
export class DbReadService {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  get<T>(path: string): Observable<T> {
    return from(
      this.auth.currentUser
        ? this.auth.currentUser.getIdToken()
        : Promise.resolve(null)
    ).pipe(
      switchMap(token => {
        const url = token ? `${dbUrl(path)}?auth=${token}` : dbUrl(path);
        return this.http.get<T>(url);
      })
    );
  }
}