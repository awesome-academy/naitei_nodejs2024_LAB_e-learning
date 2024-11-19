import { Enrollmentlesson } from "../entity/EnrollmentLesson";
import { AppDataSource } from "../repos/db";

const enrollmentlessonRepository =
  AppDataSource.getRepository(Enrollmentlesson);

export const upsertEnrollmentLesson = async (
  lesson_id: number,
  enrollment_id: number,
  progress: number
): Promise<Enrollmentlesson | null> => {
  await enrollmentlessonRepository.upsert(
    {
      lesson_id,
      enrollment_id,
      progress,
    },
    ["lesson_id", "enrollment_id"]
  );
  return await enrollmentlessonRepository.findOne({
    where: { lesson_id, enrollment_id },
  });
};

export const getEnrollmentLesson = async (
  enrollment_id: number
): Promise<Enrollmentlesson[]> => {
  return await enrollmentlessonRepository.find({ where: { enrollment_id } });
};
