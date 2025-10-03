export class Role {
  constructor(
    public id: string,
    public name: string
  ) {}
}

export const ROLES = {
  Administrator: new Role(
    "d5bc83ab-df19-4327-9367-9ce32d041c14",
    "Administrator"
  ),
  Member: new Role("07e4613a-e7ac-45f0-adab-4f12ed7f7da4", "Member"),
};

export const getRoleById = (roleId: string): Role | undefined => {
  return Object.values(ROLES).find((role) => role.id === roleId);
};

export const getAllRoles = (): { ids: string[]; names: string[] } => {
  const rolesArray = Object.values(ROLES);
  const ids = rolesArray.map((role) => role.id);
  const names = rolesArray.map((role) => role.name);
  return { ids, names };
};
