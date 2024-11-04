import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  getUserPurchasedCourses,
  filterAndSortCourses,
  getSectionsWithLessons,
  getCourseById,
  countEnrolledUsersInCourse,
  getProfessorByCourse,
  CourseFilter,
  CourseSorting,
  getProfessorAndCourseCountByCourseId
} from "../service/course.service";
import {
  getEnrollment,
  hasUserPurchasedCourse,
} from "../service/enrollment.service";
import { coursePagination } from "../constants";
import { getAllCategories } from "../service/category.service";

export const courseGet = asyncHandler(async (req: Request, res: Response) => {
  res.render("course", {
    title: req.t("home.course"),
    message: req.t("home.message"),
    user: req.session!.user
  });
});
import {
  getAllComments,
  getAllCommentsByCourseId,
} from "../service/comment.service";
import { calculateTotalTimeAndLessons } from "../service/lession.service";
import { FilterCourseDto } from "src/entity/dto/course.dto";
import { validateOrReject } from "class-validator";
import { CourseSortingFields } from "src/enum/course.enum";

export const courseShowGet = asyncHandler(
  async (req: Request, res: Response) => {
    const filterData = new FilterCourseDto();
    filterData.category = req.query.category as string | undefined;
    filterData.courseName = req.query.courseName as string | undefined;
    filterData.minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    filterData.maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    filterData.minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;

    const sortBy = req.query.sortBy as CourseSortingFields;
    if (Object.values(CourseSortingFields).includes(sortBy)) {
      filterData.sortBy = sortBy;
    }

    const sortOrder = req.query.sortOrder as 'ASC' | 'DESC';
    if (sortOrder === 'ASC' || sortOrder === 'DESC') {
      filterData.sortOrder = sortOrder;
    }

    await validateOrReject(filterData);

    try {
      await validateOrReject(filterData);
      const trans = {
        all: req.t("course.all"),
      };
                                                
      const categories = await getAllCategories();
      const userId = req.session!.user?.id;
      const userRole = req.session!.user?.role;
      const isLoggedIn = Boolean(userId);
      
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
        : coursePagination.DEFAULT_PAGE;
      const limit = coursePagination.PAGE_LIMIT;

      const { courses, total, pageCount } = await filterAndSortCourses(
        filters,
        sorting,
        page,
        limit
      );

      const payments = isLoggedIn ? await getUserPurchasedCourses(userId) : [];
      const purchasedCourseIds = payments.map((payment) => payment.course_id);
      const purchasedCourses = courses.filter((course) =>
        purchasedCourseIds.includes(course.id)
      );

      const coursesWithOwnership = courses.map(course => ({
        ...course,
        isProfessorCourse: userRole === 'professor' && course.professorId === userId
      }));

      let totalHours = 0;

      for (const course of purchasedCourses) {
        const sections = await getSectionsWithLessons(course.id);

        for (const section of sections) {
          const { total_time } = await calculateTotalTimeAndLessons(section.id);
          totalHours += total_time;
        }
      }

      res.json({
        title: req.t("home.course"),
        message: req.t("home.message"),
        courses: coursesWithOwnership,
        categories,
        purchasedCourses,
        isLoggedIn,
        filters: req.body,
        total,
        pageCount,
        currentPage: page,
        trans,
        user: req.session!.user
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
    const userRole = req.session!.user?.role;

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

    const isProfessorCourse = userRole === 'professor' && course.professor_id === userId;

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
    const allComments = await getAllCommentsByCourseId(courseId);

    const professorCourseCount = await getProfessorAndCourseCountByCourseId(courseId);

    res.render("courseDetail", {
      course,
      name: professor?.name || "Unknown Professor",
      totalHours,
      sectionsWithLessons,
      totalLessons,
      totalStudents,
      paidCourse,
      allComments,
      professorCourseCount,
      isProfessorCourse, 
      t: req.t,
      title: req.t("home.course"),
      message: req.t("home.message"),
      user: req.session!.user
    });
  }
);
