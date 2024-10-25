import "express-session"; 

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type CartItem = {
  courseId: string;
  name: string;
  price: number;
  quantity: number;
}

declare module "express-session" {
  interface SessionData {
    accessToken: string; 
    user: User;
    cart: CartItem[];
  }
}