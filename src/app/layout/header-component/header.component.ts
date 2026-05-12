import { Component, signal } from '@angular/core';

@Component({
  selector: 'llh-header-component',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {isMenuOpen = signal(false);

  navItems = [
    { label: 'Головна',        link: '/' },
    { label: 'Жанри',          link: '/genres',   hasDropdown: true },
    { label: 'Роки публікації', link: '/years' },
    { label: 'Автори',         link: '/authors' },
    { label: 'По алфавіту',    link: '/alphabet' },
    { label: 'Новини',         link: '/news' }
  ];

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }}
