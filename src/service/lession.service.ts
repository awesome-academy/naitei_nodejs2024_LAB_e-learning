import { AppDataSource } from "../repos/db";
import { Lesson } from "../entity/Lesson";
import { Section } from "@src/entity/Section";
import { In } from 'typeorm';

const lessonRepository = AppDataSource.getRepository(Lesson)
const sectionRepository = AppDataSource.getRepository(Section)


export const getAllLessons = async () => {
    return await lessonRepository.find({
        relations: ['section']
    })
}

export const createLesson = async (lessonData: Partial<Lesson>) => {
    const newLesson = await lessonRepository.create(lessonData)
    return lessonRepository.save(newLesson)
}

export const findLessonById = async (id: number) => {
    return await lessonRepository.findOne({
        where: { id: id },
        relations: ['section'] 
    })
}

export const getLessonsBySectionIds = async (sectionIds: number[]) => {
    return await lessonRepository.find({
        where: { section_id: In(sectionIds) }, 
        relations: ['section'], 
    });
};

export const updateLesson = async (id: number, lessonData: any) => {
    // Tìm bài học hiện tại
    const lesson = await lessonRepository.findOne({
      where: { id },
      relations: ['section'],
    });
  
    if (!lesson) {
      throw new Error(`Lesson with ID ${id} not found.`);
    }
  
    if (!lessonData.section_id) {
      throw new Error(`section_id is required to update lesson.`);
    }
  
    // Lấy thông tin section mới
    const newSection = await sectionRepository.findOne({
      where: { id: lessonData.section_id },
    });
  
    if (!newSection) {
      throw new Error(`Section with ID ${lessonData.section_id} not found.`);
    }
  
    const oldSection = lesson.section; 
    const oldSectionId = oldSection ? oldSection.id : null;
    const oldLessonTime = lesson.time; 
  
    if (oldSectionId && oldSectionId !== newSection.id) {
      await adjustSectionTotals(oldSectionId, -1, -oldLessonTime);
    }
  
    lesson.name = lessonData['lesson-name'];
    lesson.description = lessonData.description;
    lesson.type = lessonData.type;
    lesson.content = lessonData.content;
    lesson.time = lessonData.time; 
    lesson.section = newSection;
  
    const savedLesson = await lessonRepository.save(lesson);
  
    await adjustSectionTotals(newSection.id, 1, lessonData.time);
  
    console.log(savedLesson);
    return savedLesson;
  };

export const adjustSectionTotals = async (sectionId: number, lessonCountChange: number, timeChange: number) => {
const section = await sectionRepository.findOne({ where: { id: sectionId } });

if (section) {
    section.total_lesson = (section.total_lesson ?? 0) + lessonCountChange;
    section.total_time = (section.total_time ?? 0) + timeChange;

    if (section.total_lesson < 0) section.total_lesson = 0;
    if (section.total_time < 0) section.total_time = 0;

    await sectionRepository.save(section);
}
};

export const calculateTotalTimeAndLessons = async (sectionId: number) => {

    const lessons = await lessonRepository.find({ where: { section_id: sectionId } });

    let total_time = 0;
    let total_lesson = lessons.length; 

    lessons.forEach(lesson => {
      total_time += lesson.time; 
    });

    return { total_time, total_lesson };
};

export const saveLesson = async (lesson: Lesson) => {
    return await lessonRepository.save(lesson)
}

export const deleteLesson = async (id: number) => {
    const result = await lessonRepository.delete(id);
    return result.affected !== 0;
}