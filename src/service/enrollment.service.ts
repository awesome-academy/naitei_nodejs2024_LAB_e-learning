import { AppDataSource } from "../repos/db";
import { Enrollment } from "../entity/Enrollment";

const enrollmentRepository = AppDataSource.getRepository(Enrollment)

export const getAllEnrollments = async () => {
    return await enrollmentRepository.find({
        relations: ['user', 'course']
    })
}

export const createEnrollments = async (enrollmentData: Partial<Enrollment>) => {
    const newEnrollment = await enrollmentRepository.create(enrollmentData)
    return enrollmentRepository.save(newEnrollment)
}

export const findEnrollmentById = async (id: number) => {
    return await enrollmentRepository.findOne({
        where: { id: id },
        relations: ['user', 'course'] 
    })
}

export const saveEnrollment = async (enrollment: Enrollment) => {
    return await enrollmentRepository.save(enrollment)
}

export const deleteEnrollment = async (enrollment: Enrollment) => {
    return await enrollmentRepository.remove(enrollment)
}
