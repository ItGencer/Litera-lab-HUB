import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'llh-footer-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  sections = [
    { label: 'Головна', link: '/' },
    { label: 'Жанри', link: '/genres' },
    { label: 'Автори', link: '/authors' },
    { label: 'По алфавіту', link: '/alphabet' }
  ];

  info = [
    { label: 'Новини', link: '/news' },
    { label: 'Про нас', link: '/about' },
    { label: 'Контакти', link: '/contacts' },
    { label: 'FAQ / Допомога', link: '/faq' }
  ];}
