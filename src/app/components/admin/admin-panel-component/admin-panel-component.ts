import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { AdminUserComponent } from "../admin-user-component/admin-user-component";
import { AdminWorksComponent } from '../admin-works-component/admin-works-component';
import { AdminNewsComponent } from '../admin-news-component/admin-news-component';
import { UserComponent } from '../../user-component/user-component';
import { UsersServices } from '../../../services/users.services';
import { NewsService } from '../../../services/news.service';
import { WorksService } from '../../../services/works.service';
import { AdminTab, NavItem } from '../../../interface/nav-item.interface';

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

  public activeTab = signal<AdminTab>('users');

  public navMain: NavItem[] = [
    { id: 'users', label: 'Користувачі', icon: 'ti-users'  },
    { id: 'works', label: 'Твори',       icon: 'ti-feather' },
    { id: 'news',  label: 'Новини',      icon: 'ti-news'   },
  ];

  public navBottom: NavItem[] = [
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