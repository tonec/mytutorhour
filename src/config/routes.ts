export type Route = {
  url: string;
  title: string;
};

// Navigation routes
export const routes = {
  login: {
    url: '/login',
    title: 'Log in',
  },
  signup: {
    url: '/signup',
    title: 'Sign up',
  },
  dashboard: {
    url: '/dashboard',
    title: 'Dashboard',
  },
  students: {
    url: '/students',
    title: 'Students',
  },
  families: {
    url: '/families',
    title: 'Families',
  },
  calendar: {
    url: '/calendar',
    title: 'Calendar',
  },
  payments: {
    url: '/payments',
    title: 'Payments',
  },
  expenses: {
    url: '/expenses',
    title: 'Expenses',
  },
  settings: {
    url: '/settings',
    title: 'Settings',
  },
} as const;

const urlToTitleMap = Object.values(routes).reduce(
  (acc, route) => {
    acc[route.url] = route.title;
    return acc;
  },
  {} as Record<string, string>
);

export function getTitleByUrl(url: string): string | undefined {
  return urlToTitleMap[url];
}
