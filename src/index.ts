import 'reflect-metadata';
import { AppDataSource } from './repos/db';
import http from 'http';
import app from './server';
import { runSeeder } from './admin.seed';


app.use((req, res, next) => {
  if (!req.session!.cart) {
    req.session!.cart = [];
  }
  next();
});

// Khởi tạo nguồn dữ liệu và seed dữ liệu
AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');
    await runSeeder(AppDataSource);
     
  })
  .catch((error: unknown) => {
    console.log('Error during Data Source initialization:', error);
  });
