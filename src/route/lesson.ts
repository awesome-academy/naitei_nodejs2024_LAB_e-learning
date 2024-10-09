import express from "express";
import * as Lesson from "../controller/lesson";
import { LessonController } from "../controller/lesson";

const router = express.Router();
const lessonController = new LessonController();

router.post("/create", async (req, res) => {
  await lessonController.createLesson(req, res);
});

router.post("/:id/update", async (req, res) => {
  await lessonController.updateLesson(req, res);
});

router.delete("/:id/delete", async (req, res) => {
  await lessonController.deleteLesson(req, res);
});
router.get("/:id", async (req, res) => {
  await lessonController.getLessonById(req, res);
});
router.get("/", async (req, res) => {
  await lessonController.getAllLessons(req, res);
});
export default router;
