import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user?.role === "admin") {
    return next();
  } else {
    res.status(403).json({ message: "Access forbidden: Admins only" });
  }
};

export const isProfessor = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user?.role === 'professor') { 
    return next();
  } else {
    res.status(403).json({ message: 'Access forbidden: Professors only' });
  }
};

export const isUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user?.role === "user") {
    return next();
  } else {
    res.status(403).json({ message: "Access forbidden: User only" });
  }
};
