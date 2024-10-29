import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  getUserPurchasedCourses,
  getCoursesWithSectionsAndHours,
  filterAndSortCourses,
  getSectionsWithLessons,
  getCourseById,
  countEnrolledUsersInCourse,
  getProfessorByCourse,
} from "../service/course.service";
import { hasUserPurchasedCourse } from "../service/enrollment.service";
import { CourseFilter, CourseSorting } from "../service/course.service";
import { coursePagination } from "../constants";
import { getAllCategories } from "../service/category.service";

export const courseGet = asyncHandler(async (req: Request, res: Response) => {
  res.render("course", {
    title: req.t("home.course"),
    message: req.t("home.message"),
  });
});

export const courseShowGet = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const trans = {
        all: req.t("course.all"),
      };

      const categories = await getAllCategories();
      const userId = req.query.userId as any;
      const isLoggedIn = Boolean(userId);
      // Extract filters, sorting, and pagination options from query parameters
      const filters: CourseFilter = {
        professorId: req.query.professorId
          ? Number(req.query.professorId)
          : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minRating: req.query.minRating
          ? Number(req.query.minRating)
          : undefined,
        name: req.query.courseName ? String(req.query.courseName) : undefined,
        category: req.query.category ? String(req.query.category) : undefined,
      };

      const sorting: CourseSorting = {
        sortBy:
          req.query.sortBy === "name" ||
          req.query.sortBy === "price" ||
          req.query.sortBy === "average_rating" ||
          req.query.sortBy === "created_at"
            ? (req.query.sortBy as
                | "name"
                | "price"
                | "average_rating"
                | "created_at")
            : undefined,
        order:
          req.query.sortOrder === "ASC" || req.query.sortOrder === "DESC"
            ? (req.query.sortOrder as "ASC" | "DESC")
            : undefined,
      };

      const page = req.query.page
        ? Number(req.query.page)
        : coursePagination.DEFAULT_PAGE; // Default to page 1
      const limit = coursePagination.PAGE_LIMIT; // You can make this configurable if needed

      const { courses, total, pageCount } = await filterAndSortCourses(
        filters,
        sorting,
        page,
        limit
      );
      // let courses = await getCoursesWithSectionsAndHours();
      const payments = isLoggedIn ? await getUserPurchasedCourses(userId) : [];
      const purchasedCourseIds = payments.map((payment) => payment.course_id);
      const purchasedCourses = courses.filter((course) =>
        purchasedCourseIds.includes(course.id)
      );

      res.json({
        title: req.t("home.course"),
        message: req.t("home.message"),
        courses,
        categories,
        purchasedCourses,
        isLoggedIn,
        filters: req.body,
        total,
        pageCount,
        currentPage: page,
        trans,
      });
    } catch (error) {
      res
        .status(500)
        .render("error", { message: req.t("course.course_error") });
    }
  }
);

export const getCourseDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const courseId = Number(req.params.id);
    const userId = req.session!.user?.id;

    if (!courseId) {
      return res
        .status(400)
        .render("error", { message: req.t("course.course_error_id_required") });
    }

    const course = await getCourseById(courseId);
    if (!course) {
      return res
        .status(404)
        .render("error", { message: req.t("course.course_error_notfound") });
    }

    const paidCourse = await hasUserPurchasedCourse(userId, courseId);
    const professor = await getProfessorByCourse(courseId);
    const sectionsWithLessons = await getSectionsWithLessons(courseId);

    const totalHours = sectionsWithLessons.reduce(
      (sum, section) => sum + section.total_time,
      0
    );
    const totalLessons = sectionsWithLessons.reduce(
      (sum, section) => sum + section.lessons.length,
      0
    );
    const totalStudents = await countEnrolledUsersInCourse(courseId);

    res.render("courseDetail", {
      course,
      name: professor?.name || "Unknown Professor",
      totalHours,
      sectionsWithLessons,
      totalLessons,
      totalStudents,
      paidCourse,
      t: req.t,
      title: req.t("home.course"),
      message: req.t("home.message"),
    });
  }
);
