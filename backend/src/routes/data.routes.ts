import { Router } from 'express';
import { getFaculties, getPrograms, getModules } from '../controllers/data.controller';

const router = Router();

router.get('/faculties', getFaculties);
router.get('/programs/:facultyId', getPrograms);
router.get('/modules/:facultyId', getModules);

export default router;
