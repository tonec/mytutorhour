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
  studentNew: {
    url: '/students/new',
    title: 'Add student',
  },
  studentTags: {
    url: '/students/tags',
    title: 'Tags',
  },
  families: {
    url: '/families',
    title: 'Families',
  },
  familyNew: {
    url: '/families/new',
    title: 'Add family',
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

// Longest URLs first, so the most specific route wins when matching by prefix.
const routesBySpecificity = Object.values(routes).toSorted((a, b) => b.url.length - a.url.length);

// Exact match first; otherwise the longest route the path sits under, so a detail page such as
// /students/<id> gets its section's title ("Students").
export function getTitleByUrl(url: string): string | undefined {
  return (
    routesBySpecificity.find((route) => route.url === url) ??
    routesBySpecificity.find((route) => url.startsWith(`${route.url}/`))
  )?.title;
}
