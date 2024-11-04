import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  createPayment,
  completePaymentByUserAndCourse,
  hasUserPaidForCourse,
} from "../service/payment.service";
import { getCourseById } from "../service/course.service";
import { hasUserPurchasedCourse } from "../service/enrollment.service";
import { getItemByCourseId, removeFromCart } from "src/service/cart.service";
import { ProcessPaymentDto, SubmitPaymentDto } from "src/entity/dto/payment.dto";
import { validateOrReject } from "class-validator";

export const processPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.session!.user?.id;
    const courseIds = req.body.courseIds;
    if (!userId || !Array.isArray(courseIds)) {
      return res
        .status(400)
        .render("error", { message: req.t("payment.error_invalid_data") });
    }

    const dto = new ProcessPaymentDto();
    dto.courseIds = courseIds; 
    
    try {
      await validateOrReject(dto);
    } catch (errors) {
      return res.status(400).render("error", { message: req.t("payment.error_invalid_data"), errors });
    }

    const paymentDetails = [];

    for (const courseId of courseIds) {
      const course = await getCourseById(Number(courseId));
      if (!course) {
        return res.status(404).render("error", {
          message: req.t("payment.error_course_not_found"),
        });
      }

      const existingPayment = await hasUserPaidForCourse(
        userId,
        Number(courseId)
      );
      if (existingPayment) {
        paymentDetails.push({
          course: course.name,
          paymentDate: existingPayment.payment_date,
          status: existingPayment.status,
          amount: existingPayment.amount,
        });
        continue;
      }
      const payment = await createPayment(
        userId,
        Number(courseId),
        course.price
      );
      paymentDetails.push({
        courseId: courseId,
        course: course.name,
        paymentDate: payment.payment_date,
        status: payment.status,
        amount: payment.amount,
      });
    }

    res.render("payment", {
      t: req.t,
      username: req.session!.user?.name || "User",
      paymentDetails,
      title: req.t("home.payment"),
      message: req.t("home.message"),
    });
  }
);

export const submitPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const courseIds = req.body.courseIds;
    const userId = req.session!.user?.id;

    if (!userId || !Array.isArray(courseIds)) {
      return res
        .status(400)
        .render("error", { message: req.t("payment.error_invalid_data") });
    }

    const dto = new SubmitPaymentDto();
  dto.courseIds = courseIds;

  try {
    await validateOrReject(dto);
  } catch (errors) {
    return res.status(400).render("error", { message: req.t("payment.error_invalid_data"), errors });
  }

    try {
      for (const courseId of courseIds) {
        const updatedPayment = await completePaymentByUserAndCourse(
          userId,
          Number(courseId)
        );
        if (!updatedPayment) {
          console.error(
            `Payment not found or already completed for course ID: ${courseId}`
          );
          return res.status(404).render("error", {
            message: req.t("payment.error_payment_not_found"),
          });
        }
        const cartItem = await getItemByCourseId(courseId);
        if (!cartItem) {
          throw new Error("Cart item not found");
        }
        await removeFromCart(cartItem.id);
      }

      res.redirect("/");
    } catch (error) {
      console.error(`Error during payment update: ${error.message}`);
      return res.status(500).render("error", { message: error.message });
    }
  }
);
