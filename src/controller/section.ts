/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SectionService } from "@src/service/section";
import { Request, Response } from "express";

export class SectionController {
  private sectionService: SectionService;
  constructor() {
    this.sectionService = new SectionService();
  }

    // Xử lý POST tạo section
  async createSection(req: Request, res: Response) {
    try {
      const sectionData = req.body;
      const newSection = await this.sectionService.createSection(sectionData);
      return res
        .status(201)
        .json({ message: "Section created successfully", section: newSection });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to create section", error });
    }
  }

  // Xử lý POST cập nhật section
  async updateSection(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const isExisting = await this.sectionService.getSectionById(id);
      if (!isExisting) {
        return res.status(404).json({ message: "section not found" });
      }
      const update = await this.sectionService.updateSection(id, req.body);
      return res
        .status(200)
        .json({ message: "section updated successfully", section: update });
    } catch (error) {
      res.status(500).json({ message: "Failed to update section", error });
    }
  }

  // Xử lý DELETE xóa section
  async deleteSection(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const isExisting = await this.sectionService.getSectionById(id);
      if (!isExisting) {
        return res.status(404).json({ message: "section not found" });
      }
      await this.sectionService.deleteSection(id);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to delete section", error });
    }
  }

  // Hiển thị chi tiết một section theo ID
  async getSectionById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const section = await this.sectionService.getSectionById(id);
      if (!section) {
        return res.status(404).json({ message: "section not found" });
      }
      return res
        .status(200)
        .json({ message: "get section successfully", section: section });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to fetch section", error });
    }
  }

    // Hiển thị danh sách section
  async getAllSections(_req: Request, res: Response) {
    try {
      const sections = await this.sectionService.getAllSections();
      return res.status(200).json({ message: "get all sections successfully", sections: sections });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch sections", error });
    }
  }
}
