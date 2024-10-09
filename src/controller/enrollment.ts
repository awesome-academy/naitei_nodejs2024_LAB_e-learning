import { Request, Response } from "express";
import { EnrollmentService } from "../service/enrollment";
import { Enrollment } from "@src/entity/Enrollment";

export class EnrollmentController {
  private enrollmentService: EnrollmentService;
  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  // Xử lý POST tạo enrollment
  async createEnrollment(req: Request, res: Response) {
    try {
      const enrollmentData = req.body;
      const newEnrollment = await this.enrollmentService.createEnrollment(
        enrollmentData
      );
      return res.status(201).json({
        message: "Create Enrollment successfully",
        enrollment: newEnrollment,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to create enrollment", error: error });
    }
  }

  // Hiển thị danh sách enrollment
  async getAllEnrollments(req: Request, res: Response) {
    try {
      const enrollments = await this.enrollmentService.getAllEnrollments();
      return res.status(200).json({
        message: "get all enrollments successfully",
        enrollments: enrollments,
      });
    } catch (err) {
      return res
        .sendStatus(500)
        .json({ message: "failed to get all enrollments", err: err });
    }
  }

  // Hiển thị chi tiết một enrollment theo ID
  async getEnrollmentById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const enrollment = await this.enrollmentService.getEnrollmentById(
        Number(id)
      );
      if (enrollment) {
        return res.status(200).json({
          message: "Get enrollment successfully",
          enrollment: enrollment,
        });
      }
      return res.status(404).json({ message: "Enrollment not found" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to get enrollment", error: error });
    }
  }

  // Xử lý POST cập nhật enrollment
  async updateEnrollment(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const existingEnrollment = await this.enrollmentService.getEnrollmentById(
        Number(id)
      );
      if (existingEnrollment) {
        const updateData = req.body;
        const updatedEnrollment = await this.enrollmentService.updateEnrollment(
          Number(id),
          updateData
        );
        return res.status(200).json({
          message: "Enrollment updated successfully",
          enrollment: updatedEnrollment,
        });
      }
      return res.status(404).json({ message: "Enrollment not found" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to update enrollment", error: err });
    }
  }

  // Xử lý DELETE xóa enrollment
  async deleteEnrollment(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const existingEnrollment = await this.enrollmentService.getEnrollmentById(
        Number(id)
      );
      if (existingEnrollment) {
        await this.enrollmentService.deleteEnrollment(Number(id));
        return res.status(200).json({
          message: "Enrollment deleted successfully",
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to delete enrollment", error: err });
    }
  }
}
