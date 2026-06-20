// src/app/core/services/auth.service.ts
import { isPlatformBrowser } from '@angular/common';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
import { UsersServices } from './users.services';
import { inject, Injectable, PLATFORM_ID, EnvironmentInjector, runInInjectionContext } from '@angular/core';



@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private usersSvc = inject(UsersServices);
  private platformId = inject(PLATFORM_ID);
  private injector = inject(EnvironmentInjector); // ← додати

  async signInWithGoogle(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const fu = result.user;

    await runInInjectionContext(this.injector, async () => {
      await this.usersSvc.ensureUser(fu.uid, fu.email ?? '', fu.displayName, fu.photoURL);
      await this.usersSvc.loadCurrentUser();
    });
  }

  /** Вихід */
  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.usersSvc.currentUser.set(null);
  }
}
