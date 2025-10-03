const TENANT_USER_PREFIX = "api/tenant-users";
const TENANT_PREFIX = "api/tenants";
const EMPLOYEES_PREFIX = "api/employees";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const SHIFTS_PREFIX = "api/shifts";
const SHIFTCONFIRMATIONS_PREFIX = "api/shiftConfirmations";
const SHIFTSUBSTITUTIONS_PREFIX = "api/shiftSubstitutions";
const USER_PREFIX = "api/users";

export const LOCATIONS_ROUTES = {
  GET_lOCATIONS: `${backendUrl}/api/locations`,
  GET_LOCATIONS_UNPAGED: `${backendUrl}/api/locations/unpaged`,
};

export const TENANT_USER_ROUTES = {
  GET_TENANT_USER_CURRENT: `${TENANT_USER_PREFIX}/current`,
  GET_TENANT_USER_BY_USER: `${TENANT_USER_PREFIX}/by-user`,
};

export const TENANT_ROUTES = {
  GET_TENANTS: `${TENANT_PREFIX}`,
};

export const EMPLOYEES_ROUTES = {
  GET_EMPLOYEES: `${EMPLOYEES_PREFIX}`,
  GET_EMPLOYEES_UNPAGED: `${EMPLOYEES_PREFIX}/unpaged`,
};

export const SHIFTS_ROUTES = {
  GET_SHIFTS: `${SHIFTS_PREFIX}/today`,
  GET_SHIFTS_SELECT: `${SHIFTS_PREFIX}`,
};

export const SHIFTCONFIRMATIONS_ROUTES = {
  GET_UNPAGED: `${SHIFTCONFIRMATIONS_PREFIX}`,
};

export const SHIFTSUBSTITUTIONS_ROUTES = {
  GET_UNPAGED: `${SHIFTSUBSTITUTIONS_PREFIX}`,
};

export const USERS_ROUTES = {
  GET_USERS: `${USER_PREFIX}`,
};
