import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersServices } from '../../../services/users.services';
import { AppUser } from '../../../interface/user.interface';
import { UserTableComponent } from '../user-table/user-table-component';

@Component({
  selector: 'llh-admin-user-component',
  imports: [CommonModule, UserTableComponent],
  templateUrl: './admin-user-component.html',
  styleUrl: './admin-user-component.scss',
})
export class AdminUserComponent {
  public usersSvc = inject(UsersServices);
  public roles: AppUser['role'][] = ['admin', 'moderator', 'user'];

  // Статистика залишається тут
  public totalCount  = computed(() => this.usersSvc.users().length);
  public adminCount  = computed(() => this.usersSvc.users().filter(u => u.role === 'admin').length);
  public bannedCount = computed(() => this.usersSvc.users().filter(u => u.banned).length);

  // roleBadgeClass, onRoleChange, toggleBan — ВИДАЛЕНО (перенесено в UserTableComponent)
}