export type RouteWithoutSubRoutes = {
  type: 'prime';
  id: string;
  title: string;
  icon: React.ReactNode;
  link: string;
};

export type RouteWithSubRoutes = {
  type: 'sub';
  id: string;
  title: string;
  icon: React.ReactNode;
  subs?: {
    title: string;
    link: string;
  }[];
};

export type Route = RouteWithoutSubRoutes | RouteWithSubRoutes;
