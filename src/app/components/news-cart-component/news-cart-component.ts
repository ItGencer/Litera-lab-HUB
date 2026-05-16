import { Component, input } from '@angular/core';
import { Article } from '../../interface/article.model';

@Component({
  selector: 'llh-news-cart-component',
  imports: [],
  templateUrl: './news-cart-component.html',
  styleUrl: './news-cart-component.scss',
})
export class NewsCartComponent {
  article = input.required<Article>();
}
