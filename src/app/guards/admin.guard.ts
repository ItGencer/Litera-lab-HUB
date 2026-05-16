// src/app/guards/admin.guard.ts
import { inject }                from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user }            from '@angular/fire/auth';
import { UsersServices }         from '../services/users.services';
import { firstValueFrom }        from 'rxjs';

export const adminGuard: CanActivateFn = async () => {
  const auth     = inject(Auth);
  const usersSvc = inject(UsersServices);
  const router   = inject(Router);

  const fireUser = await firstValueFrom(user(auth));

  if (!fireUser) return router.createUrlTree(['**']);

  if (!usersSvc.currentUser()) {
    await usersSvc.loadCurrentUser();
  }

  if (usersSvc.userRole() !== 'admin') return router.createUrlTree(['**']);

  return true;
};