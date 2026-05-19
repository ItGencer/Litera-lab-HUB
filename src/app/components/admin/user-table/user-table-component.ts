import { Component, inject, input } from '@angular/core';
import { UsersServices } from '../../../services/users.services';
import { AppUser } from '../../../interface/user.interface';

@Component({
  selector: 'llh-user-table-component',
  imports: [],
  templateUrl: './user-table-component.html',
  styleUrl: './user-table-component.scss',
})
export class UserTableComponent {
  private usersSvc = inject(UsersServices);

  public users = input<AppUser[]>([]);
  public roles = input<AppUser['role'][]>([]);

  roleBadgeClass(role: AppUser['role']): string {
    return role === 'admin' ? 'b-admin'
         : role === 'moderator' ? 'b-mod'
         : 'b-user';
  }

  async onRoleChange(uid: string, event: Event): Promise<void> {
    const role = (event.target as HTMLSelectElement).value as AppUser['role'];
    if (role) await this.usersSvc.setRole(uid, role);
  }

  async toggleBan(user: AppUser): Promise<void> {
    await this.usersSvc.setBanned(user.uid, !user.banned);
  }

  async onDelete(uid: string): Promise<void> {
    if (!confirm('Видалити користувача назавжди?')) return;
    await this.usersSvc.deleteUser(uid);
  }
}