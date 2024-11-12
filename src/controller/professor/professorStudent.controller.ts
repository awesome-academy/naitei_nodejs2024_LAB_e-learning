import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getCoursesByUserId } from 'src/service/course.service';
import { getPaymentsByCourseIds } from 'src/service/payment.service';
import { getUserById } from 'src/service/user.service';
import { getEnrollment } from 'src/service/enrollment.service'; // Đảm bảo rằng hàm này đã được định nghĩa

export const professorUserShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId);
    
    if (!isLoggedIn) {
      return res.status(403).render('error', { message: req.t('admin.not_logged_in') }); 
    }

    const courses = await getCoursesByUserId(userId);

    if (!courses || courses.length === 0) {
      return res.status(404).render('error', { message: req.t('admin.no_courses_found') }); 
    }

    const courseIds = courses.map(course => course.id);
    const payments = await getPaymentsByCourseIds(courseIds);
    
    const userIds = payments.map(payment => payment.user_id);
    
    // Lấy thông tin người dùng
    const users = await Promise.all(userIds.map(id => getUserById(id)));

    // Tạo mảng kết quả để chứa thông tin người dùng cùng với khóa học và tiến trình
    const usersWithEnrollment = await Promise.all(users.map(async (user) => {
      if (!user) return null; // Kiểm tra nếu người dùng không tồn tại

      // Lấy thông tin enrollment cho từng khóa học của người dùng
      const enrollmentData = await Promise.all(courseIds.map(courseId => getEnrollment(user.id, courseId)));

      // Lọc ra khóa học đầu tiên và tiến trình tương ứng
      const firstEnrollment = enrollmentData.find(enrollment => enrollment !== null);

      return {
        ...user,
        course: firstEnrollment?.course || null, // Lưu khóa học
        enrollment: firstEnrollment // Lưu thông tin enrollment
      };
    }));

    // Lọc ra những người dùng hợp lệ
    const validUsers = usersWithEnrollment.filter(user => user !== null);

    if (validUsers.length === 0) {
      return res.status(404).render('error', { message: req.t('admin.user_not_found') }); 
    }

    return res.render('professor/studentManagement', {
      title: req.t('admin.user_management_title'),
      message: req.t('admin.user_management_message'),
      users: validUsers, 
      isLoggedIn,
      t: req.t,
    });
  } catch (error) {
    console.error(error); // In ra lỗi để kiểm tra
    res.status(500).render('error', { message: req.t('course.course_error') });
  }
});


  