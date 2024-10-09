import { AppDataSource } from "../repos/db";
import { Lesson } from "../entity/Lesson";
import { Repository, UpdateResult } from "typeorm";

export class LessonService {
  private LessonRepository: Repository<Lesson>;
  constructor() {
    this.LessonRepository = AppDataSource.getRepository(Lesson);
  }

  // Tạo một lesson mới
  async createLesson(lessonData: Partial<Lesson>) {
    const newLesson = await this.LessonRepository.save({ ...lessonData });
    return newLesson;
  }

  // Lấy danh sách lesson
  async getAllLessons() {
    return await this.LessonRepository.find();
  }

  // Lấy thông tin chi tiết của một lesson theo ID
  async getLessonById(id: number) {
    const lesson = await this.LessonRepository.findOneBy({
      id,
    });
    return lesson;
  }

  // Cập nhật thông tin của lesson theo ID
  async updateLesson(id: number, data: Partial<Lesson>) {
    await this.LessonRepository.update({ id }, { ...data });
    return await this.getLessonById(id);
  }

  // Xóa một lesson theo ID
  async deleteLesson(id: number) {
    await this.LessonRepository.delete(Number(id));
  }
}
