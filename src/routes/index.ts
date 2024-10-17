import { Router } from "express";
import i18nextMiddleware from "i18next-http-middleware";
import i18next from "../i18n";
import setLocaleMiddleware from "../middleware/setLocaleMiddleware";
import courseRoute from "./course.routes";
import homeRoute from "./home.routes";
import userRouter from "../routes/user.routes";
import paymentRoute from "./payment.routes"

const router = Router();

router.use(i18nextMiddleware.handle(i18next));
router.use(setLocaleMiddleware);

router.use("/", homeRoute);

router.use("/courses", courseRoute);
router.use("/", userRouter);

router.use('/payment', paymentRoute)

export default router;
