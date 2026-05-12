import { inject, Injectable, signal } from '@angular/core';
import { Database, ref, get, set, update, onValue } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';

export interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'moderator' | 'user' | 'guest';
  banned: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersServices {
  private db = inject(Database);
  private auth = inject(Auth);

  users = signal<AppUser[]>([]);
  currentUser = signal<AppUser | null>(null);

  /**
   * Якщо юзер ще не існує в БД — створити з роллю 'user'.
   * Викликається після кожного входу через Google.
   */
  async ensureUser(uid: string, email: string): Promise<void> {
    const userRef = ref(this.db, `Users/${uid}`); // ← великий 'U'
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      await set(userRef, {
        email,
        role: 'user', // ← всі нові = 'user'
        banned: false,
      });
    }
  }

  /** Завантажити поточного юзера з БД у сигнал */
  async loadCurrentUser(): Promise<void> {
    const fu = this.auth.currentUser;
    if (!fu) return;

    const userRef = ref(this.db, `Users/${fu.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      this.currentUser.set({ uid: fu.uid, ...snapshot.val() });
    }
  }

  /** Всі юзери — тільки для admin/moderator */
  loadAllUsers(): void {
    const usersRef = ref(this.db, 'Users');
    onValue(usersRef, (snapshot) => {
      if (!snapshot.exists()) {
        this.users.set([]);
        return;
      }
      const list: AppUser[] = [];
      snapshot.forEach((child) => {
        list.push({ uid: child.key!, ...child.val() });
      });

      this.users.set(list);
    });
  }

  async setRole(uid: string, role: AppUser['role']): Promise<void> {
    await update(ref(this.db, `Users/${uid}`), { role });
  }

  async setBanned(uid: string, banned: boolean): Promise<void> {
    await update(ref(this.db, `Users/${uid}`), { banned });
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
  isModerator(): boolean {
    const r = this.currentUser()?.role;
    return r === 'admin' || r === 'moderator';
  }
  isBanned(): boolean {
    return this.currentUser()?.banned === true;
  }
}
