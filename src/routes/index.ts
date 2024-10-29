import { Router } from "express";
import i18nextMiddleware from "i18next-http-middleware";
import i18next from "../i18n";
import setLocaleMiddleware from "../middleware/setLocaleMiddleware";
import courseRoute from "./course.routes";
import homeRoute from "./home.routes";
import userRouter from "../routes/user.routes";
import enrollmentRouter from "../routes/enrollment.routes";
import paymentmentRouter from "../routes/payment.routes";
import adminCourseRouter from "./admin/adminCourse.route";
import adminUserRouter from "./admin/adminUser.routes";
import adminPaymentRouter from "./admin/adminPayment.routes";
import adminSectionRouter from "./admin/adminSection.routes";
import adminLessonRouter from "./admin/adminLesson.routes";
import categoryRoute from "./category.routes";

const router = Router();

router.use(i18nextMiddleware.handle(i18next));
router.use(setLocaleMiddleware);

router.use("/", homeRoute);

router.use("/courses", courseRoute);
router.use("/enrollments", enrollmentRouter);
router.use("/payments", paymentmentRouter);
router.use(
  "/admins",
  adminCourseRouter,
  adminUserRouter,
  adminPaymentRouter,
  adminSectionRouter,
  adminLessonRouter
);
router.use("/categories", categoryRoute);

router.use("/", userRouter);

export default router;
