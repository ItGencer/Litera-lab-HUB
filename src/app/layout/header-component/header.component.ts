import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, user } from '@angular/fire/auth';
import { SignInComponent } from '../../components/sign-in-component/sign-in-component';
import { AuthService } from '../../services/auth.service';
import { UsersServices } from '../../services/users.services';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'llh-header-component',
  imports: [SignInComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private authSvc = inject(AuthService);
  private auth = inject(Auth);
  private router = inject(Router); // ← для навігації
  private platformId = inject(PLATFORM_ID);

  public usersSvc = inject(UsersServices);
  public fireUser = toSignal(user(this.auth));
  public isMenuOpen = signal(false);
  public isSignInOpen = signal(false);

  public navItems = [
    { label: 'Головна', link: '/' },
    { label: 'Жанри', link: '/genres', hasDropdown: true },
    { label: 'Роки публікації', link: '/years' },
    { label: 'Автори', link: '/authors' },
    { label: 'По алфавіту', link: '/alphabet' },
    { label: 'Новини', link: '/news' },
  ];

  constructor() {
    effect(() => {
      const user = this.fireUser();
      if (user) {
        this.usersSvc.loadCurrentUser(); // завантажує роль з DB
      } else {
        this.usersSvc.currentUser.set(null);
        this.usersSvc.userRole.set(null);
      }
    });
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }
  openSignIn(): void {
    this.isSignInOpen.set(true);
  }
  closeSignIn(): void {
    this.isSignInOpen.set(false);
  }

  async onSignOut(): Promise<void> {
    await this.authSvc.signOut();
    this.router.navigate(['/']); // після виходу — на головну
  }

  // Клік на аватар → перевіряємо роль → роутинг
  onAvatarClick(): void {
    const role = this.usersSvc.userRole();

    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}
