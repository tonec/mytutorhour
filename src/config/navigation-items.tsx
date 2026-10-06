import { BanknoteArrowDown, Calendar, CreditCard, Home, Users } from 'lucide-react';
import type { Route } from '@/components/navigation/types';
import { route } from './routes';

export const navigationItems: Route[] = [
  {
    type: 'prime',
    id: 'home',
    title: 'Home',
    icon: <Home className="size-4" />,
    link: route.dashboard,
  },
  {
    type: 'sub',
    id: 'students',
    title: 'Students & Families',
    icon: <Users className="size-4" />,
    subs: [
      {
        title: 'Students',
        link: route.students,
      },
      {
        title: 'Families',
        link: route.families,
      },
    ],
  },
  {
    type: 'prime',
    id: 'calendar',
    title: 'Calendar',
    icon: <Calendar className="size-4" />,
    link: route.calendar,
  },
  {
    type: 'prime',
    id: 'payments',
    title: 'Payments & invoices',
    icon: <CreditCard className="size-4" />,
    link: route.payments,
  },
  {
    type: 'prime',
    id: 'expenses',
    title: 'Expenses',
    icon: <BanknoteArrowDown className="size-4" />,
    link: route.payments,
  },
];
