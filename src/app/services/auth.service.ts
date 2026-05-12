// src/app/core/services/auth.service.ts
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser }               from '@angular/common';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { UsersServices } from './users.services';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth        = inject(Auth);
  private usersSvc    = inject(UsersServices);
  private platformId  = inject(PLATFORM_ID);

  /** Вхід через Google Popup (тільки в браузері, не SSR) */
  async signInWithGoogle(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const provider = new GoogleAuthProvider();
    const result   = await signInWithPopup(this.auth, provider);
    const fu       = result.user;

    // Якщо юзер новий — записати в БД з роллю 'user'
    await this.usersSvc.ensureUser(fu.uid, fu.email ?? '');
    // Завантажити дані з БД у сигнал
    await this.usersSvc.loadCurrentUser();
  }

  /** Вихід */
  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.usersSvc.currentUser.set(null);
  }
}