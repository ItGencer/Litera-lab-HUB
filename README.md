# 📚 Litera Lab HUB

> Онлайн-платформа про українську та зарубіжну літературу — читай, досліджуй, ділися думками.

![Status](https://img.shields.io/badge/статус-в%20розробці%20(MVP)-yellow)
![Angular](https://img.shields.io/badge/Angular-20%2B-red?logo=angular)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Realtime%20DB-orange?logo=firebase)
![SSR](https://img.shields.io/badge/SSR-Angular%20Universal-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌐 Про проєкт

**Litera Lab HUB** — це веб-платформа для всіх, хто любить читати та говорити про книги.  
Сайт об'єднує любителів як **української**, так і **зарубіжної літератури** в одному просторі.

Тут можна:
- знайти цікаву книгу через зручний каталог із пошуком;
- прочитати статті та огляди від спільноти;
- залишити власну рецензію;
- вести особисту бібліотеку — зберігати книги, які читав або хочеш прочитати.

Проєкт розраховано на **широку аудиторію** — від школярів і студентів до дорослих читачів і викладачів.

---

## ✨ Основний функціонал

| Функція | Опис |
|--------|------|
| 📖 Каталог книг | Перегляд бази книг з фільтрами та пошуком |
| 🔍 Пошук | Швидкий пошук за назвою, автором, жанром |
| 📝 Статті та огляди | Читання літературних матеріалів від спільноти |
| ✍️ Рецензії | Авторизовані користувачі можуть додавати власні рецензії |
| 👤 Особистий кабінет | Профіль користувача з персональною бібліотекою |
| 📚 Особиста бібліотека | Список книг: «читаю», «прочитано», «хочу прочитати» |
| 🔐 Автентифікація | Вхід/реєстрація через Firebase Authentication |

---

## 🛠 Технічний стек

### Frontend
- **Angular 20+** — основний фреймворк
- **Angular SSR** (Server-Side Rendering) — для швидкого завантаження та SEO
- **Angular Router** — клієнтська маршрутизація
- Префікс компонентів: **`llh`** (наприклад, `llh-header`, `llh-book-card`)

### Backend / База даних
- **Firebase Authentication** — реєстрація та вхід користувачів
- **Firebase Realtime Database** — зберігання даних у реальному часі

### API
```
https://litera-lab-hub-default-rtdb.europe-west1.firebasedatabase.app/
```

---

## 🚀 Запуск проєкту локально

### 1. Клонування репозиторію

```bash
git clone https://github.com/YOUR_USERNAME/litera-lab-hub.git
cd litera-lab-hub
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування Firebase

Створи файл `src/environments/environment.ts` та додай свої Firebase-ключі:

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "https://litera-lab-hub-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

> ⚠️ Ніколи не додавай `environment.ts` з реальними ключами до публічного репозиторію!

### 4. Запуск у режимі розробки

```bash
ng serve
```

Відкрий у браузері: [http://localhost:4200](http://localhost:4200)

### 5. Запуск з SSR (Server-Side Rendering)

```bash
npm run build
npm run serve:ssr
```

---

## 📁 Структура проєкту

```
litera-lab-hub/
├── src/
│   ├── app/
│   │   ├── services/          # Сервіси, guards, interceptors
│   │   ├── components/        # Спільні компоненти (llh-*)
│   │   ├── layout/            # Блок шапка та підвал
│   │   │   ├── header/        # Шапка сайту
│   │   │   ├── footer/        # Підвал сайту
│   │   ├── pages/             # Сторінки сайту
│   │   │   ├── alphabet/      # Твори по алфовіту
│   │   │   ├── authors/       # Спиисок авторів і їх твори
│   │   │   ├── genres/        # Жанри
│   │   │   └── main/          # головна сторінка з останніми новинами
│   │   │   ├── news/          # Список новин з літератури
│   │   │   └── years/         # Твори по рокам
│   │   ├── app.routes.ts      # Маршрути
│   │   └── app.config.ts      # Конфігурація застосунку
│   ├── environments/          # Змінні середовища
│   └── main.server.ts         # Точка входу для SSR
├── angular.json
├── package.json
└── README.md
```

---

## 📌 Поточний статус

> 🚧 **Проєкт знаходиться в активній розробці (MVP)**

- [x] Базова структура Angular-проєкту
- [x] Підключення Firebase Auth
- [x] Підключення Firebase Realtime Database
- [x] SSR налаштування
- [ ] Каталог книг
- [ ] Сторінка книги з рецензіями
- [ ] Особистий кабінет
- [ ] Статті та огляди
- [ ] Пошук та фільтрація
- [ ] Адмін-панель

---

## 🎨 Дизайн

Дизайн-прототип: [litera-hub-ua.lovable.app](https://litera-hub-ua.lovable.app)

---

## 🤝 Внесок у проєкт

Якщо хочеш долучитися до розробки:

1. Зроби **Fork** репозиторію
2. Створи нову гілку: `git checkout -b feature/назва-функції`
3. Зроби зміни та **commit**: `git commit -m 'feat: опис змін'`
4. Запуш гілку: `git push origin feature/назва-функції`
5. Відкрий **Pull Request**

---

## 📄 Ліцензія

Цей проєкт розповсюджується під ліцензією **MIT**.  
Детальніше — у файлі [LICENSE](LICENSE).

---

<p align="center">
  Зроблено з ❤️ для любителів книг в Україні та світі
</p>