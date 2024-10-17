import { AppDataSource } from "../repos/db";
import { Lesson } from "../entity/Lesson";

const lessonRepository = AppDataSource.getRepository(Lesson)

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

export const saveLesson = async (lesson: Lesson) => {
    return await lessonRepository.save(lesson)
}

export const deleteLesson = async (lesson: Lesson) => {
    return await lessonRepository.remove(lesson)
}
