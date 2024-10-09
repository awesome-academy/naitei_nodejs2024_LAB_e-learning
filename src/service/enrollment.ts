import { AppDataSource } from "../repos/db";
import { Enrollment } from "../entity/Enrollment";
import { Repository } from "typeorm";

export class EnrollmentService {
  private enrollmentRepository: Repository<Enrollment>;
  constructor() {
    this.enrollmentRepository = AppDataSource.getRepository(Enrollment);
  }
  // Lấy danh sách enrollment
  async getAllEnrollments() {
    return await this.enrollmentRepository.find();
  }

  // Lấy thông tin chi tiết của một enrollment theo ID
  async getEnrollmentById(id: number) {
    return await this.enrollmentRepository.findOneBy({ id });
  }

  // Tạo một enrollment mới
  async createEnrollment(data: Partial<Enrollment>) {
    const enrollment = await this.enrollmentRepository.save({ ...data });
    return enrollment;
  }

  // Cập nhật thông tin của enrollment theo ID
  async updateEnrollment(id: number, data: Partial<Enrollment>) {
    await this.enrollmentRepository.update({ id }, { ...data });
    return this.getEnrollmentById(id);
  }

  // Xóa một enrollment theo ID
  async deleteEnrollment(id: number) {
    await this.enrollmentRepository.delete(id);
  }
}
