

export type AdminTab = 'users' | 'works' | 'news' | 'profile';
export interface NavItem {
  id: AdminTab;
  label: string;
  icon: string;
}