import { Component, inject, OnInit, signal } from '@angular/core';
import { DbReadService } from '../services/db/db-read.service';
import { JsonPipe } from '@angular/common';
 
interface Work {
  Title: string;
  Description: string;
}

@Component({
  selector: 'llh-test',
  imports: [JsonPipe],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test  implements OnInit {
  private read = inject(DbReadService);
 
  works = signal<Work[] | null>(null);
  users = signal<any | null>(null);
  error = signal<string | null>(null);
 
  ngOnInit() {
    // Варіант А: якщо Works на корені і правила дозволяють
    this.read.get<Work[]>('Works').subscribe({
      next: result => {
        console.log('Works:', result);
        this.works.set(result);
      },
      error: err => {
        console.error('Помилка:', err);
        this.error.set(err.message);
      }
    });

    // Варіант А: якщо Works на корені і правила дозволяють
    this.read.get<any>('users').subscribe({
      next: result => {
        console.log('Users:', result);
        this.users.set(result);
      },
      error: err => {
        console.error('Помилка:', err);
        this.error.set(err.message);
      }
    });
  }
}