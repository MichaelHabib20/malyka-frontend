export interface NavItem {
    title: string;
    icon?: string;
    path?: string;
    children?: NavItem[];
    isReady?: () => boolean;
    permissions?: string[];
    rolesId?: number[];
  }