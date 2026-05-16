import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { AdminUserComponent } from "../admin-user-component/admin-user-component";
import { AdminWorksComponent } from '../admin-works-component/admin-works-component';
import { AdminNewsComponent } from '../admin-news-component/admin-news-component';
import { UserComponent } from '../../user-component/user-component';
import { UsersServices } from '../../../services/users.services';
import { NewsService } from '../../../services/news.service';
import { WorksService } from '../../../services/works.service';

export type AdminTab = 'users' | 'works' | 'news' | 'profile';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: string;
}

@Component({
  selector: 'llh-admin-panel-component',
  imports: [
    CommonModule,
    AdminUserComponent,
    AdminWorksComponent,
    UserComponent,
    AdminNewsComponent
],
  templateUrl: './admin-panel-component.html',
  styleUrl: './admin-panel-component.scss',
})
export class AdminPanelComponent implements OnInit {
  private usersSvc = inject(UsersServices);
  private worksSvc = inject(WorksService);
  private newsSvc  = inject(NewsService);

  activeTab = signal<AdminTab>('users');

  navMain: NavItem[] = [
    { id: 'users', label: 'Користувачі', icon: 'ti-users'  },
    { id: 'works', label: 'Твори',       icon: 'ti-feather' },
    { id: 'news',  label: 'Новини',      icon: 'ti-news'   },
  ];

  navBottom: NavItem[] = [
    { id: 'profile', label: 'Мій профіль', icon: 'ti-user-circle' },
  ];

  ngOnInit(): void {
    this.usersSvc.loadAllUsers();
    this.worksSvc.loadAll();
    this.newsSvc.loadAll();
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }
}