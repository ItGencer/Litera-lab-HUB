import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppUser, UsersServices } from '../../../services/users.services';

@Component({
  selector: 'llh-admin-user-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-user-component.html',
  styleUrl: './admin-user-component.scss',
})
export class AdminUserComponent {
  usersSvc = inject(UsersServices);

  roles: AppUser['role'][] = ['admin', 'moderator', 'user'];

  // Статистика
  totalCount = computed(() => this.usersSvc.users().length);
  adminCount = computed(() => this.usersSvc.users().filter((u) => u.role === 'admin').length);
  bannedCount = computed(() => this.usersSvc.users().filter((u) => u.banned).length);

  roleBadgeClass(role: AppUser['role']): string {
    return role === 'admin' ? 'b-admin' : role === 'moderator' ? 'b-mod' : 'b-user';
  }

  async onRoleChange(uid: string, event: Event): Promise<void> {
    const role = (event.target as HTMLSelectElement).value as AppUser['role'];
    if (!role) return; // ← додати цей рядок
    {
      await this.usersSvc.setRole(uid, role);
    }
  }

  async toggleBan(u: AppUser): Promise<void> {
    await this.usersSvc.setBanned(u.uid, !u.banned);
  }
}
