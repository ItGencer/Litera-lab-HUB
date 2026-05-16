import { inject, Injectable, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Database, ref, get, update, set } from '@angular/fire/database';

// ── Інтерфейси ────────────────────────────────────────────────────────────────

export interface UserProfile {
  displayName?: string;
  city?: string;
  birthYear?: string;
  about?: string;
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: string | null; // 'admin' | 'moderator' | 'user'
  banned: boolean; // ← було відсутнє
  profile?: UserProfile; // ← було відсутнє
}

// ── Сервіс ────────────────────────────────────────────────────────────────────

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

  // ── Створити запис юзера при першому вході (Google Sign-In) ─────────────────
  async ensureUser(uid: string, email: string): Promise<void> {
    const snap = await get(ref(this.db, `Users/${uid}`));

    // Якщо запис вже є — нічого не робимо
    if (snap.exists()) return;

    // Створюємо мінімальний запис
    await set(ref(this.db, `Users/${uid}`), {
      email,
      role: 'user',
      banned: false,
      profile: {},
    });
  }

  // ── Завантажити всіх юзерів (тільки для адміна) ──────────────────────────────
  async loadAllUsers(): Promise<void> {
    const snap = await get(ref(this.db, 'Users'));
    if (!snap.exists()) return;

    const raw = snap.val() as Record<string, any>;
    const list: AppUser[] = Object.entries(raw).map(([uid, data]) => ({
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
}
