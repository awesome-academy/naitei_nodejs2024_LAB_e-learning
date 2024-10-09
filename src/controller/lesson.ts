/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Lesson } from "@src/entity/Lesson";
import { LessonService } from "@src/service/lesson";
import { Request, Response } from "express";

export class LessonController {
  private lessonService: LessonService;

  constructor() {
    this.lessonService = new LessonService();
  }

    // Xử lý POST tạo lesson
  async createLesson(req: Request, res: Response) {
    try {
      const lessonData = req.body;
      const newLesson = await this.lessonService.createLesson(lessonData);
      return res.status(200).send(newLesson);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to create lesson", error });
    }
  }

  // Xử lý POST cập nhật lesson
  async updateLesson(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updatedLesson = await this.lessonService.updateLesson(id, req.body);
      if (updatedLesson) {
        return res
          .status(200)
          .json({ message: "Lesson updated", updatedLesson: updatedLesson });
      }
      return res.status(404).json({ message: "lesson not found" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to update lesson", error });
    }
  }

  // Xử lý DELETE xóa lesson
  async deleteLesson(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const isExisting = await this.lessonService.getLessonById(Number(id));
      if (!isExisting) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      await this.lessonService.deleteLesson(Number(id));
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to delete lesson", error });
    }
  }

  // Hiển thị chi tiết một lesson theo ID
  async getLessonById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const lesson = await this.lessonService.getLessonById(id);
      if (lesson) {
        return res.status(200).json(lesson);
      }
      return res.status(404).json({ message: "lesson not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson", error });
    }
  }

  // Hiển thị danh sách lesson
  async getAllLessons(_req: Request, res: Response) {
    try {
      const lessons = await this.lessonService.getAllLessons();
      return res
        .status(200)
        .json({ message: "get all lessons successfully", lessons: lessons });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to fetch lessons", error });
    }
  }
}
