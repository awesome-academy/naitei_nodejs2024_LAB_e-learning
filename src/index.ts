import 'reflect-metadata';
import { AppDataSource } from './repos/db';
import http from 'http';
import app from './server';
import session from 'express-session';
import { runSeeder } from './admin.seed';


app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false 
  }
}));

app.use((req, res, next) => {
  if (!req.session!.cart) {
    req.session!.cart = [];
  }
  next();
});

AppDataSource.initialize()
  .then( async () => {
    console.log('Data Source has been initialized!');
    await runSeeder(AppDataSource); 
  })
  .catch((error: unknown) => {
    console.log('Error during Data Source initialization:', error);
  });
