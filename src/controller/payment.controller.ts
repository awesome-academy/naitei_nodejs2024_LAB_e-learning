import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createPayment, deletePayment, findPaymentById, getAllPayments, savePayment } from '../service/payment.service';

// Get the list of payments
export const paymentList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const payments = await getAllPayments();
  res.json(payments);
});

export const paymentCreateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // You can return an HTML form here if you're rendering views
  res.json({ message: 'Ready to create a new payment' });
});

// Create a new payment
export const paymentCreatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { user_id, course_id, amount, payment_date, status } = req.body;
  const payment = await createPayment({ user_id, course_id, amount, payment_date, status })
  res.status(201).json(payment);
});

// Get details of a specific payment
export const paymentDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const payment = await findPaymentById(parseInt(req.params.id))

  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  res.json(payment);
});

export const paymentUpdateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const payment = await findPaymentById(parseInt(req.params.id));

  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  // You can return an HTML form here if you're rendering views
  // For now, let's return the payment data as JSON
  res.json(payment);
});

// Update an existing payment
export const paymentUpdatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const payment = await findPaymentById(parseInt(req.params.id))

  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  const { amount, payment_date, status } = req.body;

  payment.amount = amount;
  payment.payment_date = payment_date;
  payment.status = status;

  await savePayment(payment)
  res.json(payment);
});

// Delete a payment
export const paymentDeletePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const payment = await findPaymentById(parseInt(req.params.id))

  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  await deletePayment(payment)
  res.status(204).send(); // No content to send back
});
