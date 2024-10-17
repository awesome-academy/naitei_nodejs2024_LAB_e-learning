import { Router } from 'express'
import userRoutes from './user.routes'
import courseRoutes from './course.routes'

// **** Variables **** //
const router = Router();

/* GET home page. */
router.use('/users', userRoutes)
router.use('/courses', courseRoutes)

// **** Export default **** //
export default router;
