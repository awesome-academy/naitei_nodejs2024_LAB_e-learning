import { AppDataSource } from "../repos/db";
import { Payment } from "../entity/Payment";
import { User } from "../entity/User";
import { Course } from "../entity/Course";

const paymentRepository = AppDataSource.getRepository(Payment);

export const createPayment = async (user: User, course: Course) => {
    const payment = paymentRepository.create({
        user: user,  // In a real scenario, you'd fetch the actual user from your auth system
        course: course,
        amount: course.price,  // Assuming the payment amount is the course price
        payment_date: new Date(),
        status: 'done',  // Or set to 'pending' based on your logic
      });

    return await paymentRepository.save(payment);    
}

export const getPaymentById = async (id: number) => {
  return await paymentRepository.findOne({
    where: { id: id },
  })
}
