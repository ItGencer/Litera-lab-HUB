export interface UserProfile {
  displayName?: string;
  city?: string;
  birthYear?: string;
  about?: string;
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: string | null; // 'admin' | 'moderator' | 'user'
  banned: boolean; // ← було відсутнє
  profile?: UserProfile; // ← було відсутнє
}

export interface ProfileForm {
  displayName: string;
  city: string;
  birthYear: string;
  about: string;
}