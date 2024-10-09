import { Router } from 'express';
import sectionRoutes from './section';
import lessonRoutes from './lesson';
import enrollmentRoutes from './enrollment';

const router = Router();

router.use('/sections', sectionRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);

export default router;
