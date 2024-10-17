import { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { getPaymentById } from "../service/payment.service";

export const showPaymentPage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { payment_id } = req.params
  const userId = req.user.id

  const payment = await getPaymentById(parseInt(payment_id));
  
  if (!payment || payment.user.id !== userId) {
    res.status(404).json({ message: "Payment not found or not authorized" });
    return;
  }
  
  const course = payment.course;

  res.json({ payment, course, user: payment.user });
});
