import { EnrollmentController } from "./../controller/enrollment";
import express from "express";

const router = express.Router();
const enrollmentController = new EnrollmentController();

router.post("/create", async (req, res) => {
  await enrollmentController.createEnrollment(req, res);
});

router.post("/:id/update", async (req, res) => {
  await enrollmentController.updateEnrollment(req, res);
});

router.delete("/:id/delete", async (req, res) => {
  await enrollmentController.deleteEnrollment(req, res);
});

router.get("/:id", async (req, res) => {
  await enrollmentController.getEnrollmentById(req, res);
});

router.get("/", async (req, res) => {
  await enrollmentController.getAllEnrollments(req, res);
});

export default router;
