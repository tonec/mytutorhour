import { BanknoteArrowDown, Calendar, CreditCard, Home, Users } from 'lucide-react';
import type { NavigationItem } from '@/components/app-sidebar/navigation/types';
import { routes } from './routes';

export const navigationItems: NavigationItem[] = [
  {
    type: 'prime',
    id: 'dashboard',
    title: routes.dashboard.title,
    icon: <Home className="size-4" />,
    link: routes.dashboard.url,
  },
  {
    type: 'sub',
    id: 'students',
    title: 'Students & Families',
    icon: <Users className="size-4" />,
    subs: [
      {
        title: routes.students.title,
        link: routes.students.url,
      },
      {
        title: routes.families.title,
        link: routes.families.url,
      },
    ],
  },
  {
    type: 'prime',
    id: 'calendar',
    title: routes.calendar.title,
    icon: <Calendar className="size-4" />,
    link: routes.calendar.url,
  },
  {
    type: 'prime',
    id: 'payments',
    title: routes.payments.title,
    icon: <CreditCard className="size-4" />,
    link: routes.payments.url,
  },
  {
    type: 'prime',
    id: 'expenses',
    title: routes.expenses.title,
    icon: <BanknoteArrowDown className="size-4" />,
    link: routes.expenses.url,
  },
];
