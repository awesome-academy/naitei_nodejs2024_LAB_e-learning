import { Router } from 'express';
import * as adminReviewController from '../../controller/admin/adminReview.controller';
import { isAdmin } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/reviews', isAdmin, adminReviewController.adminReviewShowGet);  

export default router;
