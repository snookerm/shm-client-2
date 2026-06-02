import { IconUser, IconServer, IconWallet } from '@tabler/icons-react';

export const NAV_ITEMS = [
  { path: '/', labelKey: 'nav.services', icon: IconServer },
  { path: '/profile', labelKey: 'profile.title', icon: IconUser },
  { path: '/finance', labelKey: 'nav.finance', icon: IconWallet },
] as const;
