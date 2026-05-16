import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { GENRES, Work, WORK_TYPES, WorkPart, WorksService } from '../../../services/works.service';

@Component({
  selector: 'llh-admin-works-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-works-component.html',
  styleUrl: './admin-works-component.scss',
})
export class AdminWorksComponent {
  worksSvc = inject(WorksService);

  genres = GENRES;
  types  = WORK_TYPES;

  activeTab   = signal<'list' | 'add'>('list');
  editingId   = signal<string | null>(null);
  filterGenre = signal('');
  filterType  = signal('');
  isSaving    = signal(false);
  saved       = signal(false);

  DESC_MAX = 2000;
  descText = signal('');

  emptyForm = (): Partial<Work> => ({
    title: '', author: '', genre: GENRES[0], type: WORK_TYPES[0],
    year: null, description: [''], parts: [{ title: '', content: '' }],
  });
  form = signal<Partial<Work>>(this.emptyForm());

  filteredWorks = computed(() =>
    this.worksSvc.works().filter(w =>
      (!this.filterGenre() || w.genre === this.filterGenre()) &&
      (!this.filterType()  || w.type  === this.filterType())
    )
  );

  // Form field helpers
  setField<K extends keyof Work>(key: K, val: Work[K]): void {
    this.form.update(f => ({ ...f, [key]: val }));
  }

  addPart(): void {
    this.form.update(f => ({
      ...f, parts: [...(f.parts ?? []), { title: '', content: '' }],
    }));
  }

  removePart(i: number): void {
    this.form.update(f => ({
      ...f, parts: (f.parts ?? []).filter((_, idx) => idx !== i),
    }));
  }

  updatePart(i: number, key: keyof WorkPart, val: string): void {
    this.form.update(f => {
      const parts = [...(f.parts ?? [])];
      parts[i] = { ...parts[i], [key]: val };
      return { ...f, parts };
    });
  }

  // Edit existing
  startEdit(w: Work): void {
    this.editingId.set(w.id!);
    this.form.set({ ...w });
    this.descText.set(w.description.join(''));
    this.activeTab.set('add');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.set(this.emptyForm());
    this.descText.set('');
    this.activeTab.set('list');
  }

  async onSubmit(): Promise<void> {
    const f = this.form();
    if (!f.title?.trim() || !f.author?.trim()) return;

    this.isSaving.set(true);
    const payload = {
      title:       f.title!,
      author:      f.author!,
      genre:       f.genre!,
      type:        f.type!,
      year:        f.year ?? null,
      description: [this.descText()],
      parts:       f.parts ?? [],
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