import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main-component/main-component').then(m => m.MainComponent),
    title: 'Література — Головна'
  },
  {
    path: 'genres',
    loadComponent: () => import('./pages/genre-component/genres-component/genres-component').then(m => m.GenresComponent),
    title: 'Жанри'
  },
  {
    path: 'years',
    loadComponent: () => import('./pages/years-component/years-component').then(m => m.YearsComponent),
    title: 'Роки публікації'
  },
  {
    path: 'authors',
    loadComponent: () => import('./pages/authors-component/authors-component').then(m => m.AuthorsComponent),
    title: 'Автори'
  },
  {
    path: 'alphabet',
    loadComponent: () => import('./pages/alphabet-component/alphabet-component').then(m => m.AlphabetComponent),
    title: 'По алфавіту'
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news-component/news-component').then(m => m.NewsComponent),
    title: 'Новини'
  },
 {
  path: 'admin',
  canActivate: [adminGuard],   // ← тільки admin, решта → 404
  loadComponent: () =>
    import('./components/admin/admin-panel-component/admin-panel-component')
      .then(m => m.AdminPanelComponent),
  title: 'Адмін-панель'
},
{
  path: 'profile',
  canActivate: [authGuard],    // ← будь-який залогінений
  loadComponent: () =>
    import('./components/user-component/user-component')
      .then(m => m.UserComponent),
  title: 'Мій профіль'
},
  {
  path: '**',
  loadComponent: () =>
    import('./pages/error-component/error-component').then(m => m.ErrorComponent),
  title: 'Сторінку не знайдено — Litera Lab HUB'
  }
];
