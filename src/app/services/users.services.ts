import { inject, Injectable, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Database, ref, get, update, set } from '@angular/fire/database';
import { AppUser } from '../interface/user.interface';

@Injectable({ providedIn: 'root' })
export class UsersServices {
  private auth = inject(Auth);
  private db = inject(Database);

  // Поточний залогінений юзер
  public currentUser = signal<AppUser | null>(null);

  // Список ВСІХ юзерів (для адмін-панелі)
  public users = signal<AppUser[]>([]);

  // Роль поточного юзера (зручно читати окремо в хедері)
  public userRole = signal<string | null>(null);

  // ── Завантажити поточного юзера з DB ────────────────────────────────────────
  async loadCurrentUser(): Promise<void> {
    const fu = this.auth.currentUser;
    if (!fu) return;

    const snap = await get(ref(this.db, `Users/${fu.uid}`));
    const data = snap.val() ?? {};

    const appUser: AppUser = {
      uid: fu.uid,
      displayName: fu.displayName,
      email: fu.email,
      photoURL: fu.photoURL,
      role: data.role ?? 'user',
      banned: data.banned ?? false,
      profile: data.profile ?? {},
    };

    this.currentUser.set(appUser);
    this.userRole.set(appUser.role);
  }

  async ensureUser(
    uid: string,
    email: string,
    displayName?: string | null,
    photoURL?: string | null,
  ): Promise<void> {
    const snap = await get(ref(this.db, `Users/${uid}`));
    if (snap.exists()) return; // uid вже є — виходимо

    await set(ref(this.db, `Users/${uid}`), {
      email,
      displayName: displayName ?? null,
      photoURL: photoURL ?? null, // ← додати
      role: 'user',
      banned: false,
      profile: {},
    });
  }

  async loadAllUsers(): Promise<void> {
    const snap = await get(ref(this.db, 'Users'));
    if (!snap.exists()) {
      this.users.set([]);
      return;
    }

    const raw = snap.val() as Record<string, any>;

    // Map автоматично дає унікальні uid
    const list: AppUser[] = Object.entries(raw)
      .filter(([, data]) => data && data.email) // виключаємо порожні записи
      .map(([uid, data]) => ({
        uid,
        displayName: data.profile?.displayName ?? data.displayName ?? null,
        email: data.email ?? null,
        photoURL: data.photoURL ?? null,
        role: data.role ?? 'user',
        banned: data.banned ?? false,
        profile: data.profile ?? {},
      }));

    this.users.set(list);
  }

  // ── Змінити роль юзера ───────────────────────────────────────────────────────
  async setRole(uid: string, role: string): Promise<void> {
    await update(ref(this.db, `Users/${uid}`), { role });

    // Оновити локальний сигнал без перезавантаження
    this.users.update((list) => list.map((u) => (u.uid === uid ? { ...u, role } : u)));
  }

  // ── Заблокувати / розблокувати юзера ────────────────────────────────────────
  async setBanned(uid: string, banned: boolean): Promise<void> {
    await update(ref(this.db, `Users/${uid}`), { banned });

    this.users.update((list) => list.map((u) => (u.uid === uid ? { ...u, banned } : u)));
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST', // ← змінено з DELETE на POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });

      if (!res.ok) {
        // Безпечний парсинг — Vercel може повернути HTML замість JSON
        let errorMsg = `HTTP ${res.status}`;
        try {
          const err = await res.json();
          errorMsg = err.error ?? errorMsg;
        } catch {
          errorMsg = await res.text().catch(() => errorMsg);
        }
        console.error('[deleteUser] Server error:', errorMsg);
        alert(`Помилка видалення: ${errorMsg}`);
        return;
      }

      this.users.update((list) => list.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error('[deleteUser] Network error:', err);
      alert('Мережева помилка. Перевір консоль сервера.');
    }
  }
}
