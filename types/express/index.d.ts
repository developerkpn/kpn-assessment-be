declare namespace Express {
  interface Request {
    userDecode?: {
      user_id: string;
      role_id: string;
      email?: string;
      permission: Array<{
        menu_id: number;
        fcreate: boolean;
        fread: boolean;
        fupdate: boolean;
        fdelete: boolean;
      }>;
    };
  }
}
