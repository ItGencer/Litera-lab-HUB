// src/app/services/db/db-read.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { dbUrl } from './db.config';

@Injectable({ providedIn: 'root' })
export class DbReadService {
  private http = inject(HttpClient);
  
  get<T>(path: string): Observable<T> {
    return this.http.get<T>(dbUrl(path));
  }
}