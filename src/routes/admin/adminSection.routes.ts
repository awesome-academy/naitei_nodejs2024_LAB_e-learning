import { Router } from 'express';
import * as adminSectionController from '../../controller/admin/adminSection.controller';
import { isAdmin } from '../../middleware/roleCheckMiddleware';

const router: Router = Router();

router.get('/sections', isAdmin, adminSectionController.adminSectionShowGet);


export default router;
