import { Router } from "express";
import i18nextMiddleware from "i18next-http-middleware";
import i18next from "../i18n";
import setLocaleMiddleware from "../middleware/setLocaleMiddleware";
import courseRoute from "./course.routes";
import homeRoute from "./home.routes";
import userRouter from "../routes/user.routes";
import paymentRouter from "../routes/payment.routes"
import commentRouter from "../routes/comment.routes"
import reviewRouter from "../routes/review.routes"
import enrollmentRouter from "../routes/enrollment.routes"
import lessonRouter from "../routes/lesson.routes"

const router = Router();

router.use(i18nextMiddleware.handle(i18next));
router.use(setLocaleMiddleware);

router.use("/", homeRoute);

router.use("/courses", courseRoute);
router.use("/", userRouter);

router.use('/payment', paymentRouter)
router.use('/comments', commentRouter)
router.use('/reviews', reviewRouter);
router.use('/enrollments', enrollmentRouter);
router.use('/lessons', lessonRouter);

export default router;
