import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { GENRES, WORK_TYPES, WorksService, hasPartsForType } from '../../../services/works.service';
import { Work, WorkPart, WorkType } from '../../../interface/work.interface';
import { extractYear, isFutureIsoDate, isValidIsoDate, todayIso } from '../../../guards/date.guard';

@Component({
  selector: 'llh-admin-works-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-works-component.html',
  styleUrl: './admin-works-component.scss',
})
export class AdminWorksComponent {
  worksSvc = inject(WorksService);

  public activeTab   = signal<'list' | 'add'>('list');
  public editingId   = signal<string | null>(null);
  public filterGenre = signal('');
  public filterType  = signal('');
  public isSaving    = signal(false);
  public saved       = signal(false);
  public descText = signal('');
  public errors    = signal<Record<string, string>>({});

  /** Сьогоднішня дата — обмежує date-інпути, щоб не можна було обрати майбутнє */
  public maxDate = todayIso();
  /** Дістає рік з ISO-дати для показу в таблиці (винесено з utils, щоб викликати з шаблону) */
  public extractYear = extractYear;

  public worksType: WorkType = {
    genres: GENRES,
    types: WORK_TYPES,
    desc_max: 2000,
  }

  emptyForm = (): Partial<Work> => {
    const type = WORK_TYPES[0];
    return {
      title: '', author: '', genre: GENRES[0], type,
      year: null, description: [''],
      hasParts: hasPartsForType(type), parts: [{ title: '', content: '' }],
    };
  };
  form = signal<Partial<Work>>(this.emptyForm());

  filteredWorks = computed(() =>
    this.worksSvc.works().filter(works =>
      (!this.filterGenre() || works.genre === this.filterGenre()) &&
      (!this.filterType()  || works.type  === this.filterType())
    )
  );

  // Form field helpers
  setField<K extends keyof Work>(key: K, val: Work[K]): void {
    this.form.update(form => ({ ...form, [key]: val }));
  }

  /** Зміна "Тип" — автоматично вмикає/вимикає поділ на частини (Вірш/Поема → текст, Роман/Повість → частини) */
  onTypeChange(type: string): void {
    const willHaveParts = hasPartsForType(type);
    this.form.update((f) => {
      const parts = willHaveParts
        ? (f.parts?.length ? f.parts : [{ title: '', content: '' }])
        : [{ title: '', content: f.parts?.[0]?.content ?? '' }];
      return { ...f, type, hasParts: willHaveParts, parts };
    });
  }

  addPart(): void {
    this.form.update(form => ({
      ...form, parts: [...(form.parts ?? []), { title: '', content: '' }],
    }));
  }

  removePart(index: number): void {
    this.form.update(form => ({
      ...form, parts: (form.parts ?? []).filter((_, idx) => idx !== index),
    }));
  }

  updatePart(index: number, key: keyof WorkPart, val: string): void {
    this.form.update(form => {
      const parts = [...(form.parts ?? [])];
      parts[index] = { ...parts[index], [key]: val };
      return { ...form, parts };
    });
  }

  // Edit existing
  startEdit(work: Work): void {
    this.editingId.set(work.id!);
    this.form.set({ ...work, hasParts: work.hasParts ?? hasPartsForType(work.type) });
    this.descText.set(work.description.join(''));
    this.errors.set({});
    this.activeTab.set('add');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.set(this.emptyForm());
    this.descText.set('');
    this.errors.set({});
    this.activeTab.set('list');
  }

  /** Перевіряє форму твору: назва/автор/дата обов'язкові, текст (частин або суцільний) не може бути порожнім */
  private validate(): Record<string, string> {
    const f = this.form();
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

  async onSubmit(): Promise<void> {
    const errors = this.validate();
    this.errors.set(errors);
    if (Object.keys(errors).length) return;

    const form = this.form();
    this.isSaving.set(true);
    const payload = {
      title:       form.title!.trim(),
      author:      form.author!.trim(),
      genre:       form.genre!,
      type:        form.type!,
      year:        form.year ?? null,
      description: [this.descText()],
      hasParts:    !!form.hasParts,
      parts:       form.parts ?? [],
    };

    if (this.editingId()) {
      await this.worksSvc.update(this.editingId()!, payload);
    } else {
      await this.worksSvc.save(payload);
    }

    this.isSaving.set(false);
    this.saved.set(true);
    this.cancelEdit();
    setTimeout(() => this.saved.set(false), 3000);
  }

  async deleteWork(id: string): Promise<void> {
    if (!confirm('Видалити твір?')) return;
    await this.worksSvc.delete(id);
  }
}