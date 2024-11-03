import { Router } from 'express';
import * as adminCommentController from '../../controller/admin/adminComment.controller';
import { isAdmin } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/comments', isAdmin, adminCommentController.adminCommentShowGet);

export default router;
