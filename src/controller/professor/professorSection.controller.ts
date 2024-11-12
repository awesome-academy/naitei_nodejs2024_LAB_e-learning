import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createSection, updateSection, deleteSection, calculateTotalTimeAndLessons } from 'src/service/section.service';
import { getCoursesByUserId } from 'src/service/course.service';
import { CreateSectionDto, UpdateSectionDto } from 'src/entity/dto/section.dto';
import { validateOrReject, ValidationError  } from 'class-validator';

export const professorCreateSection = asyncHandler(async (req: Request, res: Response) => {
  try {
    const courseIds = Array.isArray(req.body.course_id) ? req.body.course_id : [req.body.course_id];
    const names = Array.isArray(req.body.name) ? req.body.name : [req.body.name];

    if (!courseIds.length || !names.length) {
      res.status(400).json({ errors: [{ property: 'general', messages: ["Course ID and Section Name are required."] }] });
      return;
    }

    const validationErrors = [];

    for (let i = 0; i < names.length; i++) {
      const courseId = Number(courseIds[i]);

      if (isNaN(courseId)) {
        validationErrors.push({
          property: `course_id_${i}`, 
          messages: ["Invalid Course ID."]
        });
        continue;
      }

      const sectionData = new CreateSectionDto();
      sectionData.name = names[i] || undefined;

      try {
        await validateOrReject(sectionData);
      } catch (errors) {
        (errors as ValidationError[]).forEach((error: ValidationError) => {
          validationErrors.push({
            property: `name_${i}`,
            messages: error.constraints ? Object.values(error.constraints) : []
          });
        });
      }
    }

    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
      return;
    }

    const savedSections = [];
    for (let i = 0; i < names.length; i++) {
      const newSection = await createSection({
        name: names[i],
        course_id: Number(courseIds[i]),
      });
      await calculateTotalTimeAndLessons(newSection.id);
      savedSections.push(newSection);
    }

    res.status(200).json({ success: true, sections: savedSections });

  } catch (error: unknown) {
    console.error("Error creating section:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(400).json({ errors: [{ property: 'general', messages: [errorMessage] }] });
  }
});

export const professorUpdateSection = asyncHandler(async (req: Request, res: Response) => {
  try {
    const sectionId = Number(req.body.id);
    const sectionName = req.body['name'];
    const courseId = req.body.course_id;


    if (isNaN(sectionId)) {
       res.status(400).json({ errors: [{ property: 'id', messages: ['Invalid section ID.'] }] });
       return;
    }

    const sectionData = new UpdateSectionDto();
    sectionData.name = sectionName?.trim();

    await validateOrReject(sectionData); 

    const updatedSection = await updateSection(sectionId, { name: sectionName, course_id: courseId });

    if (!updatedSection) {
       res.status(404).json({ errors: [{ property: 'general', messages: ['Section not found.'] }] });
       return;
    }

    await calculateTotalTimeAndLessons(sectionId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error caught in professorUpdateSection:", error); 

    if (Array.isArray(error) && error[0].constraints) {
      const validationErrors = error.map(err => ({
        property: err.property,
        messages: Object.values(err.constraints),
      }));
      res.status(400).json({ errors: validationErrors });
    } else {
      res.status(400).json({ errors: [{ property: 'general', messages: [error.message || 'An unexpected error occurred'] }] });
    }
  }
});

export const professorDeleteSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await deleteSection(Number(id)); 
    if (!success) {
      res.status(404).render('error', { message: req.t('professor.section_not_found')});
      return;
    }
    res.status(204).send(); 
  } catch (error) {
    res.status(400).render('error',{ message: error.message });
  }
};