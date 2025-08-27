declare namespace Express {
  interface Request {
    userDecode?: {
      user_id: string;
      role_id?: string;
      role_name?: string;
      bu_id?: string;
      email?: string;
      type?: string;
      permission?: Array<{
        menu_id: number;
        fcreate: boolean;
        fread: boolean;
        fupdate: boolean;
        fdelete: boolean;
      }>;
    };
    user_type?: string;
  }
}

declare module "base64-xor" {
  export function encode(key: string, data: Buffer | string): string;
  export function decode(key: string, data: Buffer | string): string;
  const _default: {
    encode: typeof encode;
    decode: typeof decode;
  };
  export default _default;
}
