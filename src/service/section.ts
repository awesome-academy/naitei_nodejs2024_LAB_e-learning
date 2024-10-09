import { AppDataSource } from "../repos/db";
import { Section } from "../entity/Section";
import { Repository } from "typeorm";

export class SectionService {
  private sectionRepository: Repository<Section>;
  constructor() {
    this.sectionRepository = AppDataSource.getRepository(Section);
  }

  // Tạo một section mới
  async createSection(data: Partial<Section>) {
    const newSection = await this.sectionRepository.save(data);
    return newSection;
  }

  // Lấy danh sách section
  async getAllSections() {
    return await this.sectionRepository.find();
  }

  // Lấy thông tin chi tiết của một section theo ID
  async getSectionById(id: number) {
    return await this.sectionRepository.findOneBy({
      id,
    });
  }

  // Cập nhật thông tin của section theo ID
  async updateSection(id: number, data: Partial<Section>) {
    await this.sectionRepository.update(Number(id), data);
    return await this.sectionRepository.findOneBy({ id });
  }

  // Xóa một section theo ID
  deleteSection = async (id: number) => {
    await this.sectionRepository.delete(Number(id));
  };
}
