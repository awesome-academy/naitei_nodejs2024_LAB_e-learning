import { AppDataSource } from "../repos/db";
import { Payment } from "../entity/Payment";

const paymentRepository = AppDataSource.getRepository(Payment)

export const getAllPayments = async () => {
    return await paymentRepository.find({
        relations: ['user', 'course']
    })
}

export const createPayment = async (paymentData: Partial<Payment>) => {
    const newPayment = await paymentRepository.create(paymentData)
    return paymentRepository.save(newPayment)
}

export const findPaymentById = async (id: number) => {
    return await paymentRepository.findOne({
        where: { id: id },
        relations: ['user', 'course'] 
    })
}

export const savePayment = async (payment: Payment) => {
    return await paymentRepository.save(payment)
}

export const deletePayment = async (payment: Payment) => {
    return await paymentRepository.remove(payment)
}
