// src/app/services/db/db.config.ts
 
import { environment } from '../../../environments/environment';
 
// Береться з environment.ts — одне місце для зміни
const DB_BASE_URL = environment.firebase.databaseURL;

export function dbUrl(path: string): string {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${DB_BASE_URL}/${clean}.json`;
}
 