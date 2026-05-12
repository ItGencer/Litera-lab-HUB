import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
 {
    path: 'authors/:id', // Наприклад, для динамічних сторінок авторів
    renderMode: RenderMode.Server // Краще використовувати Server (SSR), якщо дані часто змінюються
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender // Для статичних сторінок (Головна, Про нас)
  }
];
