import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { NewsService } from '../../../services/news.service';
import { NewsItem } from '../../../interface/news.interface';
import { Sign } from 'node:crypto';

@Component({
  selector: 'llh-admin-news-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-news-component.html',
  styleUrl: './admin-news-component.scss',
})
export class AdminNewsComponent {
  public newsSvc:NewsService = inject(NewsService);
  public activeTab           = signal<'list' | 'add'>('list');
  public editingId           = signal<string | null>(null);
  public isSaving            = signal(false);
  public saved               = signal(false);
  public newsMax: number     = 3000;

  emptyForm = () => ({ title: '', text: '', imageUrl: '' });
  form = signal(this.emptyForm());

  setField(key: keyof typeof this.form, val: string): void {
    this.form.update(f => ({ ...f, [key]: val }));
  }

  startEdit(item: NewsItem): void {
    this.form.set({
      title:    item.title,
      text:     item.text,
      imageUrl: item.imageUrl ?? '',
    });
    this.editingId.set(item.id!);
    this.activeTab.set('add');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.set(this.emptyForm());
    this.activeTab.set('list');
  }

  async onSubmit(): Promise<void> {
    const f = this.form();
    if (!f.title.trim() || !f.text.trim()) return;
    this.isSaving.set(true);

    if (this.editingId()) {
      await this.newsSvc.update(this.editingId()!, {
        title: f.title, text: f.text, imageUrl: f.imageUrl,
      });
    } else {
      await this.newsSvc.save({
        title: f.title, text: f.text, imageUrl: f.imageUrl,
      });
    }

    this.isSaving.set(false);
    this.saved.set(true);
    this.cancelEdit();
    setTimeout(() => this.saved.set(false), 3000);
  }

  async deleteItem(id: string): Promise<void> {
    if (!confirm('Видалити новину?')) return;
    await this.newsSvc.delete(id);
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('uk-UA', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
}