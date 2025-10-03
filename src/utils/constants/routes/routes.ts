import { getAllRoles } from "@/utils/auth/roles";

const PREFIX = {
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
};

export type AUTH_PATHS_KEY =
  | "dashboard"
  | "partners"
  | "reports"
  | "reserve"
  | "sellers"
  | "voucher";

type Routes = {
  public: {
    auth: {
      login: string;
      register: string;
    };
  };
  authenticated: {
    [_key in AUTH_PATHS_KEY]: {
      path: string;
      permittedRoles: string[];
    };
  };
};

export const routes: Routes = {
  public: {
    auth: {
      login: `${PREFIX.AUTH}/login`,
      register: `${PREFIX.AUTH}/register`,
    },
  },
  authenticated: {
    dashboard: {
      path: PREFIX.DASHBOARD,
      permittedRoles: getAllRoles().ids,
    },
    reserve: {
      path: `${PREFIX.DASHBOARD}/reserve`,
      permittedRoles: getAllRoles().ids,
    },
    partners: {
      path: `${PREFIX.DASHBOARD}/partners`,
      permittedRoles: getAllRoles().ids,
    },
    sellers: {
      path: `${PREFIX.DASHBOARD}/sellers`,
      permittedRoles: getAllRoles().ids,
    },
    voucher: {
      path: `${PREFIX.DASHBOARD}/voucher`,
      permittedRoles: getAllRoles().ids,
    },
    reports: {
      path: `${PREFIX.DASHBOARD}/reports`,
      permittedRoles: getAllRoles().ids,
    },
  },
};

export const publicRoutes = (): string[] => {
  const publicRoutes: string[] = [];

  function extractRoutes(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        extractRoutes(obj[key]);
      } else {
        publicRoutes.push(obj[key] as string);
      }
    }
  }

  extractRoutes(routes.public);
  return publicRoutes;
};
