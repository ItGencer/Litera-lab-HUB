import { inject, Injectable, signal } from '@angular/core';
import { Database, ref, get, set, update, onValue } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';

export interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'moderator' | 'user' | 'guest';
  banned: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class UsersServices {
  private db = inject(Database);
  private auth = inject(Auth);

  // Signal зі списком усіх користувачів
  users = signal<AppUser[]>([]);
  // Signal з поточним користувачем
  currentUser = signal<AppUser | null>(null);

  // --- Створити / зареєструвати користувача в БД ---
  async createUser(uid: string, email: string, role: AppUser['role'] = 'user'): Promise<void> {
    const userRef = ref(this.db, `users/${uid}`);
    await set(userRef, {
      email,
      role,
      banned: false
    });
  }

  // --- Отримати поточного користувача ---
  async loadCurrentUser(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = ref(this.db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      this.currentUser.set({ uid: user.uid, ...snapshot.val() });
    }
  }

  // --- Завантажити всіх користувачів (тільки admin/moderator) ---
  loadAllUsers(): void {
    const usersRef = ref(this.db, 'users');

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

  // --- Змінити роль користувача (тільки admin) ---
  async setRole(uid: string, role: AppUser['role']): Promise<void> {
    const userRef = ref(this.db, `users/${uid}`);
    await update(userRef, { role });
  }

  // --- Забанити / розбанити ---
  async setBanned(uid: string, banned: boolean): Promise<void> {
    const userRef = ref(this.db, `users/${uid}`);
    await update(userRef, { banned });
  }

  // --- Перевірки ролі ---
  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isModerator(): boolean {
    const role = this.currentUser()?.role;
    return role === 'admin' || role === 'moderator';
  }

  isBanned(): boolean {
    return this.currentUser()?.banned === true;
  }
}