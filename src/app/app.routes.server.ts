import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '', // головна
    renderMode: RenderMode.Prerender
  },
  {
    path: 'genres',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'years',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'authors',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'alphabet',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'news',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**', // решта (404 → redirect)
    renderMode: RenderMode.Server
  }
];
