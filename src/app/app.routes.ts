import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main-component/main-component').then(m => m.MainComponent),
    title: 'Література — Головна'
  },
  {
    path: 'genres',
    loadComponent: () => import('./pages/genres/genres-component/genres-component').then(m => m.GenresComponent),
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
  { path: '**', redirectTo: '' } // Перенаправлення, якщо сторінку не знайдено
];
