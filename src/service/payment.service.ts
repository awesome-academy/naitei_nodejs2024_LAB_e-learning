import { AppDataSource } from '../repos/db';
import { User } from '../entity/User';
import { Course } from '../entity/Course';
import { Payment } from '../entity/Payment';
import { ALL } from 'dns';
import { In } from 'typeorm'; 

const courseRepository = AppDataSource.getRepository(Course);
const userRepository = AppDataSource.getRepository(User);
const paymentRepository = AppDataSource.getRepository(Payment);


export async function createPayment(userId: number, courseId: number, amount: number): Promise<Payment> {

    const user = await userRepository.findOneBy({ id: userId });
    const course = await courseRepository.findOneBy({ id: courseId });

    if (!user || !course) {
      throw new Error('User or Course not found');
    }

    const payment = paymentRepository.create({
      user_id: user.id,
      course_id: course.id,
      amount,
      status: 'pending', 
      payment_date: new Date(),
    });

    return paymentRepository.save(payment);
}

export async function getPaymentsByCourseIds(courseIds: number[]): Promise<Payment[]> {
  if (!courseIds || courseIds.length === 0) {
    return []; 
  }

  const payments = await paymentRepository.find({
    where: {
      course_id: In(courseIds)
    },
    relations: ['user'], 
  });

  return payments; 
}
export async function completePaymentByUserAndCourse(userId: number, courseId: number): Promise<Payment | null> {
    const payment = await paymentRepository.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
        status: 'pending' 
      }
    });
  
    if (!payment) {
      throw new Error('Payment not found or already completed');
    }
  
    payment.status = 'done'; 
    payment.payment_date = new Date(); 
  
    return paymentRepository.save(payment);
  }

export async function hasUserPaidForCourse(userId: number, courseId: number): Promise<Payment | null> {
    const payment = await paymentRepository.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
        status: 'done', 
      },
    });
  
    return payment || null; 
  }

  export async function getAllPayments() {  
    const payments = await paymentRepository.find({
      relations: ['user', 'course'], 
      select: {
        id: true,
        amount: true,
        payment_date: true,
        status: true,
        user: { name: true },
        course: { name: true },
      },
      order: {
        payment_date: 'DESC',
      },
    });
  
    return payments.map(payment => ({
      id: payment.id,
      user: payment.user?.name || 'N/A',
      course: payment.course?.name || 'N/A',
      amount: payment.amount,
      payment_date: payment.payment_date, 
      status: payment.status,
    }));
  }