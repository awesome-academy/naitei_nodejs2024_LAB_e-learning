import { AppDataSource } from "../repos/db";
import { Lesson } from "../entity/Lesson";
import { Section } from "@src/entity/Section";

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

export const updateLesson = async (id: number, lessonData: any) => { 
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

    const section = await sectionRepository.findOne({
        where: { id: lessonData.section_id },
    });

    if (!section) {
        throw new Error(`Section with ID ${lessonData.section_id} not found.`);
    }

    lesson.name = lessonData.name;
    lesson.description = lessonData.description;
    lesson.type = lessonData.type;
    lesson.content = lessonData.content;
    lesson.time = lessonData.time; 
    lesson.section_id = section.id;

    return await lessonRepository.save(lesson);
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