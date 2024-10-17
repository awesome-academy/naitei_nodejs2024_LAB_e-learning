import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user?.role === 'admin') { 
      return next();
    } else {
      res.status(403).json({ message: 'Access forbidden: Admins only' });
    }
  };

// Middleware to check if the user is a professor or admin
export const isProfessor = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user?.role === 'professor') {
    return next();
  }
  res.status(403).json({ message: 'Access forbidden: Professors only' });
};
