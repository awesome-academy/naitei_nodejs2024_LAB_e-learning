import { Router } from "express";
import i18nextMiddleware from "i18next-http-middleware";
import i18next from "../i18n";
import setLocaleMiddleware from "../middleware/setLocaleMiddleware";
import courseRoute from "./course.routes";
import homeRoute from "./home.routes";
import userRouter from "../routes/user.routes";
import enrollmentRouter from "../routes/enrollment.routes";
import paymentmentRouter from "../routes/payment.routes";
import cartRouter from "../routes/cart.routes"
import adminCourseRouter from "./admin/adminCourse.route";
import adminUserRouter from "./admin/adminUser.routes";
import adminPaymentRouter from "./admin/adminPayment.routes";
import adminSectionRouter from "./admin/adminSection.routes";
import adminLessonRouter from "./admin/adminLesson.routes";
import adminCommentRouter from "./admin/adminComment.routes";
import adminReviewRouter from "./admin/adminReview.routes";
import categoryRoute from "./category.routes";
import professorLessonRouter from "./professor/professorLesson.routes"
import professorCourseRouter from "./professor/professorCourse.route";
import professorSectionRouter from "./professor/professorSection.routes";
import professorStudentRouter from "./professor/professorStudent.routes";
import commentRouter from "../routes/comment.routes";
import reviewRouter from "../routes/review.routes";
const router = Router();

router.use(i18nextMiddleware.handle(i18next));
router.use(setLocaleMiddleware);

router.use("/", homeRoute);

router.use("/courses", courseRoute);
router.use("/enrollments", enrollmentRouter);
router.use("/payments", paymentmentRouter);
router.use("/cart", cartRouter)
router.use("/admins", adminCourseRouter, adminUserRouter, adminPaymentRouter, adminSectionRouter,adminLessonRouter, adminCommentRouter, adminReviewRouter);
router.use("/categories", categoryRoute);
router.use("/professors", professorStudentRouter, professorCourseRouter, professorSectionRouter,professorLessonRouter);
router.use(
  "/admins",
  adminCourseRouter,
  adminUserRouter,
  adminPaymentRouter,
  adminSectionRouter,
  adminLessonRouter
);
router.use("/comments", commentRouter);
router.use("/reviews", reviewRouter);
router.use("/", userRouter);

export default router;
