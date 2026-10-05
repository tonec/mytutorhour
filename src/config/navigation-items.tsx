import {
  Infinity,
  Activity,
  DollarSign,
  Home,
  LinkIcon,
  Package2,
  Percent,
  PieChart,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { Route } from '@/components/app-sidebar/nav-main';

export const navigationItems: Route[] = [
  {
    id: 'home',
    title: 'Home',
    icon: <Home className="size-4" />,
    link: '#',
  },
  {
    id: 'products',
    title: 'Products',
    icon: <Package2 className="size-4" />,
    link: '#',
    subs: [
      {
        title: 'Catalogue',
        link: '#',
        icon: <Package2 className="size-4" />,
      },
      {
        title: 'Checkout Links',
        link: '#',
        icon: <LinkIcon className="size-4" />,
      },
      {
        title: 'Discounts',
        link: '#',
        icon: <Percent className="size-4" />,
      },
    ],
  },
  {
    id: 'usage-billing',
    title: 'Usage Billing',
    icon: <PieChart className="size-4" />,
    link: '#',
    subs: [
      {
        title: 'Meters',
        link: '#',
        icon: <PieChart className="size-4" />,
      },
      {
        title: 'Events',
        link: '#',
        icon: <Activity className="size-4" />,
      },
    ],
  },
  {
    id: 'benefits',
    title: 'Benefits',
    icon: <Sparkles className="size-4" />,
    link: '#',
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: <Users className="size-4" />,
    link: '#',
  },
  {
    id: 'sales',
    title: 'Sales',
    icon: <ShoppingBag className="size-4" />,
    link: '#',
    subs: [
      {
        title: 'Orders',
        link: '#',
        icon: <ShoppingBag className="size-4" />,
      },
      {
        title: 'Subscriptions',
        link: '#',
        icon: <Infinity className="size-4" />,
      },
    ],
  },
  {
    id: 'storefront',
    title: 'Storefront',
    icon: <Store className="size-4" />,
    link: '#',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: <TrendingUp className="size-4" />,
    link: '#',
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: <DollarSign className="size-4" />,
    link: '#',
    subs: [
      { title: 'Incoming', link: '#' },
      { title: 'Outgoing', link: '#' },
      { title: 'Payout Account', link: '#' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings className="size-4" />,
    link: '#',
    subs: [
      { title: 'General', link: '#' },
      { title: 'Webhooks', link: '#' },
      { title: 'Custom Fields', link: '#' },
    ],
  },
];
