import { Component, inject, computed, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { user } from '@angular/fire/auth';
import { Database, ref, update, get } from '@angular/fire/database';
import { UsersServices } from '../../services/users.services';
import { WorksService, Work, WorkPart, GENRES, WORK_TYPES } from '../../services/works.service';

export type UserTab = 'profile' | 'works' | 'add';

interface ProfileForm {
  displayName: string;
  city: string;
  birthYear: string;
  about: string;
}
@Component({
  selector: 'llh-user-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-component.html',
  styleUrl: './user-component.scss',
})
export class UserComponent implements OnInit {
  private auth = inject(Auth);
  private db = inject(Database);
  usersSvc = inject(UsersServices);
  worksSvc = inject(WorksService);

  fireUser = toSignal(user(this.auth), { initialValue: null });
  activeTab = signal<UserTab>('profile');

  genres = GENRES;
  types = WORK_TYPES;
  ABOUT_MAX = 300;
  DESC_MAX = 2000;

  // ── Profile form ──────────────────────────────────────────
  profileForm = signal<ProfileForm>({
    displayName: '',
    city: '',
    birthYear: '',
    about: '',
  });
  isSavingProfile = signal(false);
  profileSaved = signal(false);

  // ── Works list filters ────────────────────────────────────
  filterGenre = signal('');
  filterType = signal('');

  myWorks = computed(() => {
    const uid = this.usersSvc.currentUser()?.uid;
    if (!uid) return [];
    return this.worksSvc
      .works()
      .filter(
        (w) =>
          w.createdBy === uid &&
          (!this.filterGenre() || w.genre === this.filterGenre()) &&
          (!this.filterType() || w.type === this.filterType()),
      );
  });

  // ── Add / Edit work form ──────────────────────────────────
  editingId = signal<string | null>(null);
  workForm = signal<Partial<Work>>({
    title: '',
    author: '',
    genre: GENRES[0],
    type: WORK_TYPES[0],
    year: null,
    description: [''],
    parts: [{ title: '', content: '' }],
  });
  descText = signal('');
  isSavingWork = signal(false);
  workSaved = signal(false);

  // ── Helpers ───────────────────────────────────────────────
  initials = computed(() => {
    const profile = this.usersSvc.currentUser()?.profile;
    const name =
      profile?.displayName ??
      this.fireUser()?.displayName ??
      this.usersSvc.currentUser()?.email ??
      '';
    return name.slice(0, 2).toUpperCase();
  });

  roleBadgeClass = computed(() => {
    switch (this.usersSvc.currentUser()?.role) {
      case 'admin':
        return 'badge-admin';
      case 'moderator':
        return 'badge-mod';
      default:
        return 'badge-user';
    }
  });

  ngOnInit() {
    this.worksSvc.loadAll();
    this.loadProfileExtras();
  }

  /** Завантажити додаткові поля профілю (city, birthYear, about, displayName) */
  private async loadProfileExtras() {
    const uid = this.usersSvc.currentUser()?.uid;
    if (!uid) return;
    const snap = await get(ref(this.db, `Users/${uid}/profile`));
    if (snap.exists()) {
      const p = snap.val();
      this.profileForm.set({
        displayName: p.displayName ?? '',
        city: p.city ?? '',
        birthYear: p.birthYear ?? '',
        about: p.about ?? '',
      });
    }
  }

  // ── Profile actions ───────────────────────────────────────
  async saveProfile() {
    const uid = this.usersSvc.currentUser()?.uid;
    if (!uid) return;
    this.isSavingProfile.set(true);
    await update(ref(this.db, `Users/${uid}/profile`), this.profileForm());
    this.isSavingProfile.set(false);
    this.profileSaved.set(true);
    setTimeout(() => this.profileSaved.set(false), 3000);
  }

  updateProfile(key: keyof ProfileForm, value: string) {
    this.profileForm.update((f) => ({ ...f, [key]: value }));
  }

  // ── Work form actions ─────────────────────────────────────
  startEdit(work: Work) {
    this.editingId.set(work.id!);
    this.workForm.set({ ...work });
    this.descText.set(work.description.join(''));
    this.activeTab.set('add');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.resetWorkForm();
    this.activeTab.set('works');
  }

  addPart() {
    this.workForm.update((f) => ({
      ...f,
      parts: [...(f.parts ?? []), { title: '', content: '' }],
    }));
  }

  removePart(i: number) {
    this.workForm.update((f) => ({
      ...f,
      parts: (f.parts ?? []).filter((_, idx) => idx !== i),
    }));
  }

  updatePart(i: number, key: keyof WorkPart, val: string) {
    this.workForm.update((f) => {
      const parts = [...(f.parts ?? [])];
      parts[i] = { ...parts[i], [key]: val };
      return { ...f, parts };
    });
  }

  updateField<K extends keyof Work>(key: K, val: Work[K]) {
    this.workForm.update((f) => ({ ...f, [key]: val }));
  }

  async saveWork() {
    const f = this.workForm();
    if (!f.title?.trim() || !f.author?.trim()) return;
    this.isSavingWork.set(true);

    const payload = {
      title: f.title!,
      author: f.author!,
      genre: f.genre!,
      type: f.type!,
      year: f.year ?? null,
      description: [this.descText()],
      parts: f.parts ?? [],
    };

    if (this.editingId()) {
      await this.worksSvc.update(this.editingId()!, payload);
    } else {
      await this.worksSvc.save(payload);
    }

    this.isSavingWork.set(false);
    this.workSaved.set(true);
    this.editingId.set(null);
    this.resetWorkForm();
    setTimeout(() => {
      this.workSaved.set(false);
      this.activeTab.set('works');
    }, 1500);
  }

  async deleteWork(id: string) {
    if (!confirm('Видалити твір?')) return;
    await this.worksSvc.delete(id);
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private resetWorkForm() {
    this.workForm.set({
      title: '',
      author: '',
      genre: GENRES[0],
      type: WORK_TYPES[0],
      year: null,
      description: [''],
      parts: [{ title: '', content: '' }],
    });
    this.descText.set('');
  }
}
