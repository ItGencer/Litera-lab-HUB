import { Component, inject, output, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsersServices } from '../../services/users.services';

@Component({
  selector: 'llh-sign-in-component',
  imports: [],
  templateUrl: './sign-in-component.html',
  styleUrl: './sign-in-component.scss',
})
export class SignInComponent {
  /** Подія закриття — батько (header) слухає її */
  close = output<void>();

  private authSvc  = inject(AuthService);
  private usersSvc = inject(UsersServices);

  isLoading = signal(false);
  errorMsg  = signal<string | null>(null);

  async onGoogleSignIn(): Promise<void> {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    try {
      await this.authSvc.signInWithGoogle();
      this.close.emit(); // закрити модалку після успіху
    } catch (err: any) {
      // Ігнорувати якщо юзер закрив popup
      if (err?.code !== 'auth/popup-closed-by-user') {
        this.errorMsg.set('Помилка входу. Спробуйте ще раз.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}