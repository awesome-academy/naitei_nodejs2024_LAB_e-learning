import { SectionController } from "@src/controller/section";
import express from "express";

const router = express.Router();
const sectionController = new SectionController();
router.post("/create", async (req, res) => {
  await sectionController.createSection(req, res);
});
router.post("/:id/update", async (req, res) => {
  await sectionController.updateSection(req, res);
});

router.post("/:id/delete", async (req, res) => {
  await sectionController.deleteSection(req, res);
});

router.get("/:id", async (req, res) => {
  await sectionController.getSectionById(req, res);
});

router.get("/", async (req, res) => {
  await sectionController.getAllSections(req, res);
});
export default router;
