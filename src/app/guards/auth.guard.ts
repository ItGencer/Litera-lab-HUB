// src/app/guards/auth.guard.ts
import { inject }                from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user }            from '@angular/fire/auth';
import { firstValueFrom }        from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const auth   = inject(Auth);
  const router = inject(Router);

  const fireUser = await firstValueFrom(user(auth));

  // Не залогінений → 404
  if (!fireUser) return router.createUrlTree(['**']);

  // Залогінений → пропускаємо
  return true;
};