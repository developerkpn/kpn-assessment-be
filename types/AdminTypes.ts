export type User = {
  email: string;
  username: string;
  fullname: string;
  user_id: string;
  role_id: string;
};

export type TokenPayload = {
  user_id: string;
  email?: string;
  role_id: string;
  permission: Array<{
    menu_id: number;
    fcreate: boolean;
    fread: boolean;
    fupdate: boolean;
    fdelete: boolean;
  }>;
};

export type TokenAssesseePayload = Omit<TokenPayload, "email" | "role_id" | "permission"> & {
  type: "external" | "internal";
};

export type Permission = {
  menu_id: number;
  fcreate: boolean;
  fread: boolean;
  fupdate: boolean;
  fdelete: boolean;
};
