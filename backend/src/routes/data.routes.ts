import { Router } from 'express';
import { getFaculties, getPrograms, getModules } from '../controllers/data.controller';

const router = Router();

router.get('/faculties', getFaculties);
router.get('/programs/:facultyId', getPrograms);
// Modules are global (shared across faculties) in this MVP
router.get('/modules', getModules);

export default router;
