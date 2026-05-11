import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'llh-header-component',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {isMenuOpen = signal(false);

  navItems = [
    { label: 'Головна', link: '#' },
    { label: 'Жанри', link: '#', hasDropdown: true },
    { label: 'Роки публікації', link: '#' },
    { label: 'Автори', link: '#' },
    { label: 'По алфавіту', link: '#' },
    { label: 'Новини', link: '#' }
  ];

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }}
