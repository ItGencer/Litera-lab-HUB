import { Component, inject, OnInit, signal } from '@angular/core';
import { NewsCartComponent } from '../../components/news-cart-component/news-cart-component';
import { ArticlesService } from '../../services/articles.service';
import { Article } from '../../interface/article.model';

@Component({
  selector: 'llh-main-component',
  imports: [NewsCartComponent],
  templateUrl: './main-component.html',
  styleUrl: './main-component.scss',
})
export class MainComponent implements OnInit {
  private articlesService = inject(ArticlesService);

  articles = signal<Article[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.articlesService.getNews().subscribe({  // ← getNews() замість getArticles()
      next: (data) => {
        this.articles.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Не вдалося завантажити новини');
        this.isLoading.set(false);
      }
    });
  }
}