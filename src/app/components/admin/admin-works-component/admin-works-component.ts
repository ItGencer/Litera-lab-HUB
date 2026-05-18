import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { GENRES, WORK_TYPES, WorksService } from '../../../services/works.service';
import { Work, WorkPart, WorkType } from '../../../interface/work.interface';

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

  public worksType: WorkType = {
    genres: GENRES,
    types: WORK_TYPES,
    desc_max: 2000,
  }

  emptyForm = (): Partial<Work> => ({
    title: '', author: '', genre: GENRES[0], type: WORK_TYPES[0],
    year: null, description: [''], parts: [{ title: '', content: '' }],
  });
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
    this.form.set({ ...work });
    this.descText.set(work.description.join(''));
    this.activeTab.set('add');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.set(this.emptyForm());
    this.descText.set('');
    this.activeTab.set('list');
  }

  async onSubmit(): Promise<void> {
    const form = this.form();
    if (!form.title?.trim() || !form.author?.trim()) return;

    this.isSaving.set(true);
    const payload = {
      title:       form.title!,
      author:      form.author!,
      genre:       form.genre!,
      type:        form.type!,
      year:        form.year ?? null,
      description: [this.descText()],
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