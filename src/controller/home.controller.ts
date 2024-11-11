import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  getCoursesWithSectionsAndHours,
  getUserPurchasedCourses,
  getSectionsWithLessons,
  updateCourseAverageRating,
} from "../service/course.service";
import { getAmountOfCartItems } from "../service/cart.service";
import { calculateTotalTimeAndLessons } from "../service/lession.service";
export const renderHomePage = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.session!.user?.id;
      const user = req.session?.user;
      const isLoggedIn = !!user;
      const isProfessor = isLoggedIn && req.session!.user?.role === 'professor';
      const isAdmin = isLoggedIn && req.session!.user?.role === 'admin';

      const courses = await getCoursesWithSectionsAndHours();
      const cartAmount = await getAmountOfCartItems(userId);

      const payments = isLoggedIn ? await getUserPurchasedCourses(userId) : [];
      const purchasedCourseIds = payments.map((payment) => payment.course_id);

      for (const course of courses) {
        await updateCourseAverageRating(course.id);
      }

      const purchasedCourses = courses.filter((course) =>
        purchasedCourseIds.includes(course.id)
      );

      res.render("index", {
        title: req.t("home.home"),
        message: { message: req.t("home.message") },
        courses,
        cartAmount,
        t: req.t,
        purchasedCourses,
        user: req.session!.user,
        isLoggedIn,
        isProfessor,
        isAdmin
      });
    } catch (error) {
      res.status(500).render("error", { message: req.t("course.course_error") });
    }
  }
);
