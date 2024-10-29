import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@src/service/lesson.service";

export const adminLesonShowGet = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.session!.user?.id;
      const isLoggedIn = Boolean(userId);

      if (!isLoggedIn) {
        return res
          .status(403)
          .render("error", { message: req.t("admin.not_logged_in") });
      }

      const lessons = await getAllLessons();

      if (!lessons) {
        return res
          .status(404)
          .render("error", { message: req.t("admin.user_not_found") });
      }

      return res.render("admin/lessonManagement", {
        title: req.t("admin.user_management_title"),
        message: req.t("admin.user_management_message"),
        lessons,
        isLoggedIn,
        t: req.t,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .render("error", { message: req.t("course.course_error") });
    }
  }
);

export const adminCreateLesson = async (req: Request, res: Response) => {
  try {
    const sectionId = parseInt(req.body.course);
    if (isNaN(sectionId)) {
      throw new Error("Invalid CourseId");
    }

    const lessons = await createLesson({
      name: req.body.name,
      type: req.body.type,
      section_id: sectionId,
      content: req.body.content,
      description: req.body.description,
      time: req.body.time,
    });

    res.redirect(`/admins/lessons`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const adminUpdateLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.body.id);
    const sectionId = Number(req.body.section_id);
    if (isNaN(lessonId) || isNaN(sectionId)) {
      res.status(400).json({ message: "Invalid lesson ID or section ID." });
      return;
    }

    const updatedLesson = await updateLesson(lessonId, {
      name: req.body["lesson-name"],
      description: req.body["description"],
      type: req.body["type"],
      content: req.body["content"],
      time: Number(req.body["time"]),
      section_id: sectionId,
    });

    if (!updatedLesson) {
      res.status(404).json({ message: "Lesson not found." });
      return;
    }

    res.redirect(`/admins/lessons`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const adminDeleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await deleteLesson(Number(id));

    if (!success) {
      res.status(404).json({ message: "Lesson not found." });
      return;
    }
    res.redirect(`/admins/lessons`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
