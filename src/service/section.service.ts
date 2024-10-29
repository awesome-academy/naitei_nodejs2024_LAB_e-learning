import { AppDataSource } from "../repos/db";
import { Section } from "../entity/Section";
import { Course } from "../entity/Course";
import { Lesson } from "../entity/Lesson";
import { In } from 'typeorm';

const sectionRepository = AppDataSource.getRepository(Section)
const courseRepository = AppDataSource.getRepository(Course)
const lessonRepository = AppDataSource.getRepository(Lesson)


export const getAllSections = async () => {
    return await sectionRepository.find({
        relations: ['course']
    })
}

export const getSectionsByCourseIds = async (courseIds: number[]) => {
  return await sectionRepository.find({
    where: { course: { id: In(courseIds) } },
    relations: ['course'], 
  });
};

export async function createSection(data: Partial<Section>): Promise<Section> {
    const newSection = sectionRepository.create({
        name: data.name,
        total_time: 0,
        total_lesson: 0,
        course_id: data.course_id 
    });
  
    return await sectionRepository.save(newSection);
}

export const calculateTotalTimeAndLessons = async (sectionId: number) => {

    const lessons = await lessonRepository.find({ where: { section_id: sectionId } });

    let total_time = 0;
    let total_lesson = lessons.length; 

    lessons.forEach(lesson => {
      total_time += lesson.time; 
    });

    return { total_time, total_lesson };
};
export const updateSection = async (id: number, body: any) => {
  const section = await sectionRepository.findOne({
    where: { id },
    relations: ['course'], 
  });

  if (!section) {
    throw new Error(`Section with ID ${id} not found.`);
  }

  section.name = body['section-name'];
  section.total_time = Number(body['total-time']); 
  section.total_lesson = Number(body['total-lessons']); 

  const newCourse = await courseRepository.findOne({ where: { id: body.course_id } });
  if (!newCourse) {
    throw new Error(`Course with ID ${body.course_id} not found.`);
  }

  section.course = newCourse; 

  const savedSection = await sectionRepository.save(section);
  
  return savedSection; 
};


export async function deleteSection(id: number): Promise<boolean> {
  const result = await sectionRepository.delete(id);
  return result.affected !== 0;
}