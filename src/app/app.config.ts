import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Firebase імпорти
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';

// Імпорт твого конфігу (переконайся, що шлях правильний)
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Твої існуючі налаштування
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()), // Твоя фіча реплею подій

    // --- Firebase блоки ---
    
    // 1. Головна ініціалізація
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // 2. База даних (Firestore)
    provideFirestore(() => getFirestore()),

    // 3. Аналітика (безпечно для SSR)
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService
  ]
};