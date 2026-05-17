import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersServices } from '../../../services/users.services';
import { AppUser } from '../../../interface/user.interface';

@Component({
  selector: 'llh-user-table-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-table-component.html',
  styleUrl: './user-table-component.scss',
})
export class UserTableComponent {
  // inject сервісу прямо тут — вся логіка в цьому компоненті
  private usersSvc = inject(UsersServices);

  // signal-based inputs (Angular 17+)
  public users = input<AppUser[]>([]);
  public roles = input<AppUser['role'][]>([]);

  roleBadgeClass(role: AppUser['role']): string {
    return role === 'admin' ? 'b-admin'
         : role === 'moderator' ? 'b-mod'
         : 'b-user';
  }

  async onRoleChange(uid: string, event: Event): Promise<void> {
    const role = (event.target as HTMLSelectElement).value as AppUser['role'];
    if (!role) return;
    await this.usersSvc.setRole(uid, role);
  }

  async toggleBan(user: AppUser): Promise<void> {
    await this.usersSvc.setBanned(user.uid, !user.banned);
  }}
