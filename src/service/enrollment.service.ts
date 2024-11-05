import { AppDataSource } from '../repos/db';
import { Enrollment } from '../entity/Enrollment';
import { User } from '../entity/User';
import { Course } from '../entity/Course';
import { Payment } from '../entity/Payment';
import { Lesson } from '../entity/Lesson';
import { Section } from '@src/entity/Section';


const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const courseRepository = AppDataSource.getRepository(Course);
const userRepository = AppDataSource.getRepository(User);
const paymentRepository = AppDataSource.getRepository(Payment);
const lessonRepository = AppDataSource.getRepository(Lesson);
const sectionRepository = AppDataSource.getRepository(Section);

export async function hasUserPurchasedCourse(userId: number, courseId: number): Promise<boolean> {
    const enrollment = await paymentRepository.findOne({
        where: { user: { id: userId }, course: { id: courseId }, status: 'done' },
    });
    return enrollment !== null; 
}

export async function enrollUserInCourse(userId: number, courseId: number): Promise<Enrollment> {
    const user = await userRepository.findOne({ where: { id: userId } });
    const course = await courseRepository.findOne({ where: { id: courseId } });

    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }

    if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
    }

    const enrollment = enrollmentRepository.create({
        user,
        course,
        enrollment_date: new Date(),
        progress: 0,
    });

    await enrollmentRepository.save(enrollment);
    return enrollment;
}

export async function getEnrollmentWithCourseAndUser(userId: number, courseId: number): Promise<Enrollment | null> {
    let enrollment = await enrollmentRepository.findOne({
        where: { user: { id: userId }, course: { id: courseId } },
        relations: ['course', 'user'],
    });

    if (!enrollment) {
        const user = await userRepository.findOne({ where: { id: userId } });
        const course = await courseRepository.findOne({ where: { id: courseId } });

        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        if (!course) {
            throw new Error(`Course with ID ${courseId} not found`);
        }

        enrollment = enrollmentRepository.create({
            user_id: user.id, 
            course_id: course.id, 
            enrollment_date: new Date(),
            completion_date: null, 
            progress: 0,
        });

        await enrollmentRepository.save(enrollment);
    }
    return enrollment; 
}

export async function countEnrolledUsersInCourse(courseId: number): Promise<number> {
    return await enrollmentRepository.count({
        where: {
            course: { id: courseId },
            user: { role: 'user' }, 
        },
        relations: ['user'], 
    });
}

export async function getEnrollment(userId: number, courseId: number): Promise<Enrollment | null> {
    if (isNaN(userId) || isNaN(courseId)) {
        throw new Error('Invalid userId or courseId');
    }

    const enrollment = await enrollmentRepository.findOne({
        where: {
            user: { id: userId }, 
            course: { id: courseId }, 
        },
        relations: ['user', 'course'], 
    });

    return enrollment; 
}

export async function getLessons(courseId: number) {
    const sections = await sectionRepository.find({
      where: { course: { id: courseId } },
    });

    const lessonsArray: any[] = [];

    await Promise.all(
      sections.map(async (section) => {
        const lessons = await lessonRepository.find({
          where: { section: { id: section.id } },
          select: ['id', 'name', 'type', 'content', 'description', 'time', 'created_at', 'updated_at'],
        });

        lessonsArray.push(...lessons);
      })
    );

    return lessonsArray;
  }

  export  async function markLessonAsDone(lessonId: number, enrollmentId: number): Promise<Lesson> {
    const lesson = await lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) throw new Error('Lesson not found');
    lesson.progress = 100; 
    await lessonRepository.save(lesson);

    return lesson;
  }

  export async function updateEnrollmentProgress(enrollmentId: number): Promise<void> {
    const enrollment = await enrollmentRepository.findOne({
        where: { id: enrollmentId },
        relations: ['course', 'course.sections', 'course.sections.lessons'],
    });

    if (!enrollment) throw new Error(`Enrollment with ID ${enrollmentId} not found`);

    const lessons = enrollment.course.sections.flatMap(section => section.lessons);
    const totalLessons = lessons.length;

    const completedLessons = lessons.filter(lesson => lesson.progress === 100).length;
    enrollment.progress = (totalLessons > 0) ? (completedLessons / totalLessons) * 100 : 0;

    enrollment.completion_date = enrollment.progress === 100 ? new Date() : null;

    await enrollmentRepository.save(enrollment);
}
