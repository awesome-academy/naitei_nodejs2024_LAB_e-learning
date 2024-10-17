import 'express-serve-static-core';
import { User } from '.../entity/User';

declare module 'express-serve-static-core' {
  interface Response {
    setLocale?: (locale: string) => void;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
