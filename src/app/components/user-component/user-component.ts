import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { user } from '@angular/fire/auth';
import { Database, ref, update, get } from '@angular/fire/database';
import { UsersServices } from '../../services/users.services';
import { WorksService, GENRES, WORK_TYPES, hasPartsForType } from '../../services/works.service';
import { Work, WorkPart, WorkType } from '../../interface/work.interface';
import { ProfileForm } from '../../interface/user.interface';
import { todayIso, isValidIsoDate, isFutureIsoDate, extractYear } from '../../guards/date.guard';

export type UserTab = 'profile' | 'works' | 'add';
 
@Component({
  selector: 'llh-user-component',
  imports: [FormsModule],
  templateUrl: './user-component.html',
  styleUrl: './user-component.scss',
})
export class UserComponent implements OnInit {
  private auth     = inject(Auth);
  private db       = inject(Database);
  private worksSvc = inject(WorksService);
 
  public usersSvc  = inject(UsersServices);
  public fireUser  = toSignal(user(this.auth), { initialValue: null });
  public activeTab = signal<UserTab>('profile');
 
  public workType: WorkType = {
    genres: GENRES, types: WORK_TYPES, about_max: 300, desc_max: 2000,
  };

  /** Сьогоднішня дата — обмежує date-інпути, щоб не можна було обрати майбутнє */
  public maxDate = todayIso();
  /** Дістає рік з ISO-дати для показу в бейджах (винесено з utils, щоб викликати з шаблону) */
  public extractYear = extractYear;

  // ── Profile ───────────────────────────────────────────────
  profileForm     = signal<ProfileForm>({ displayName: '', city: '', birthDate: '', about: '' });
  isSavingProfile = signal(false);
  profileSaved    = signal(false);
  profileErrors   = signal<Record<string, string>>({});
 
  // ── Works filters ─────────────────────────────────────────
  filterGenre = signal('');
  filterType  = signal('');
 
  myWorks = computed(() => {
    const uid = this.usersSvc.currentUser()?.uid;
    if (!uid) return [];
    return this.worksSvc.works().filter(
      (w) => w.createdBy === uid
          && (!this.filterGenre() || w.genre === this.filterGenre())
          && (!this.filterType()  || w.type  === this.filterType()),
    );
  });
 
  // ── Work form ─────────────────────────────────────────────
  editingId    = signal<string | null>(null);
  workForm     = signal<Partial<Work>>(this.emptyWork());
  descText     = signal('');
  isSavingWork = signal(false);
  workSaved    = signal(false);
  workErrors   = signal<Record<string, string>>({});
 
  // ── Helpers ───────────────────────────────────────────────
  initials = computed(() => {
    const name =
      this.usersSvc.currentUser()?.profile?.displayName ??
      this.fireUser()?.displayName ??
      this.usersSvc.currentUser()?.email ?? '';
    return name.slice(0, 2).toUpperCase();
  });
 
  roleBadgeClass = computed(() => {
    const r = this.usersSvc.currentUser()?.role;
    return r === 'admin' ? 'badge-admin' : r === 'moderator' ? 'badge-mod' : 'badge-user';
  });
 
  ngOnInit() {
    this.worksSvc.loadAll();
    this.loadProfileExtras();
  }
 
  private async loadProfileExtras() {
    const uid = this.usersSvc.currentUser()?.uid;
    if (!uid) return;
    const snap = await get(ref(this.db, `Users/${uid}/profile`));
    if (snap.exists()) {
      const p = snap.val();
      this.profileForm.set({
        displayName: p.displayName ?? '',
        city:        p.city        ?? '',
        birthDate:   p.birthDate   ?? '',
        about:       p.about       ?? '',
      });
    }
  }
 
  // ── Profile actions ───────────────────────────────────────
  async saveProfile() {
    const errors = this.validateProfile();
    this.profileErrors.set(errors);
    if (Object.keys(errors).length) return;

    const uid = this.usersSvc.currentUser()?.uid;
    if (!uid) return;
    this.isSavingProfile.set(true);
    await update(ref(this.db, `Users/${uid}/profile`), this.profileForm());
    this.isSavingProfile.set(false);
    this.profileSaved.set(true);
    setTimeout(() => this.profileSaved.set(false), 3000);
  }

  /** Перевіряє форму профілю. Ім'я обов'язкове; дата народження — опційна, але якщо вказана, має бути коректною й не з майбутнього */
  private validateProfile(): Record<string, string> {
    const f = this.profileForm();
    const errors: Record<string, string> = {};

    if (!f.displayName?.trim()) errors['displayName'] = "Вкажіть ім'я";

    if (f.birthDate) {
      if (!isValidIsoDate(f.birthDate)) errors['birthDate'] = 'Некоректна дата';
      else if (isFutureIsoDate(f.birthDate)) errors['birthDate'] = 'Дата не може бути у майбутньому';
    }

    return errors;
  }
 
  updateProfile(key: keyof ProfileForm, value: string) {
    this.profileForm.update((f) => ({ ...f, [key]: value }));
  }
 
  // ── Work actions ──────────────────────────────────────────

  /** Таб "Додати твір" — скидає форму і відкриває 'add' (без конфлікту з cancelEdit) */
  startAdd() {
    this.editingId.set(null);
    this.workForm.set(this.emptyWork());
    this.descText.set('');
    this.workErrors.set({});
    this.activeTab.set('add');
  }

  /** Кнопка "Редагувати" у списку */
  startEdit(work: Work) {
    this.editingId.set(work.id!);
    this.workForm.set({ ...work, hasParts: work.hasParts ?? hasPartsForType(work.type) });
    this.descText.set(work.description.join(''));
    this.workErrors.set({});
    this.activeTab.set('add');
  }

  /** Кнопка "Скасувати" у формі — повертає на список */
  cancelEdit() {
    this.editingId.set(null);
    this.workForm.set(this.emptyWork());
    this.descText.set('');
    this.workErrors.set({});
    this.activeTab.set('works');
  }

  /** Зміна "Тип" — автоматично вмикає/вимикає поділ на частини (Вірш/Поема → текст, Роман/Повість → частини) */
  onTypeChange(type: string) {
    const willHaveParts = hasPartsForType(type);
    this.workForm.update((f) => {
      const parts = willHaveParts
        ? (f.parts?.length ? f.parts : [{ title: '', content: '' }])
        : [{ title: '', content: f.parts?.[0]?.content ?? '' }];
      return { ...f, type, hasParts: willHaveParts, parts };
    });
  }

  addPart() {
    this.workForm.update((f) => ({
      ...f, parts: [...(f.parts ?? []), { title: '', content: '' }],
    }));
  }

  removePart(i: number) {
    this.workForm.update((f) => ({
      ...f, parts: (f.parts ?? []).filter((_, idx) => idx !== i),
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

  /** Перевіряє форму твору: назва/автор/дата обов'язкові, текст (частин або суцільний) не може бути порожнім */
  private validateWork(): Record<string, string> {
    const f = this.workForm();
    const errors: Record<string, string> = {};

    if (!f.title?.trim())  errors['title']  = "Назва твору обов'язкова";
    if (!f.author?.trim()) errors['author'] = "Ім'я автора обов'язкове";

    if (!f.year) {
      errors['year'] = 'Вкажіть дату написання';
    } else if (!isValidIsoDate(f.year)) {
      errors['year'] = 'Некоректна дата';
    } else if (isFutureIsoDate(f.year)) {
      errors['year'] = 'Дата не може бути у майбутньому';
    }

    const parts = f.parts ?? [];
    if (f.hasParts) {
      parts.forEach((p, i) => {
        if (!p.title?.trim())   errors[`part_${i}_title`]   = 'Вкажіть назву частини';
        if (!p.content?.trim()) errors[`part_${i}_content`] = 'Текст частини не може бути порожнім';
      });
    } else if (!parts[0]?.content?.trim()) {
      errors['content'] = 'Текст твору не може бути порожнім';
    }

    return errors;
  }

  async saveWork() {
    const errors = this.validateWork();
    this.workErrors.set(errors);
    if (Object.keys(errors).length) return;

    const f = this.workForm();
    this.isSavingWork.set(true);

    const payload = {
      title: f.title!.trim(), author: f.author!.trim(), genre: f.genre!, type: f.type!,
      year: f.year ?? null, description: [this.descText()],
      hasParts: !!f.hasParts, parts: f.parts ?? [],
    };

    this.editingId()
      ? await this.worksSvc.update(this.editingId()!, payload)
      : await this.worksSvc.save(payload);

    this.isSavingWork.set(false);
    this.workSaved.set(true);
    this.workErrors.set({});
    this.editingId.set(null);
    this.workForm.set(this.emptyWork());
    this.descText.set('');
    setTimeout(() => { this.workSaved.set(false); this.activeTab.set('works'); }, 1500);
  }

  async deleteWork(id: string) {
    if (!confirm('Видалити твір?')) return;
    await this.worksSvc.delete(id);
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('uk-UA', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  /** Порожня форма твору — виведено в окремий метод щоб не дублювати */
  private emptyWork(): Partial<Work> {
    const type = WORK_TYPES[0];
    return {
      title: '', author: '', genre: GENRES[0], type,
      year: null, description: [''],
      hasParts: hasPartsForType(type), parts: [{ title: '', content: '' }],
    };
  }
}