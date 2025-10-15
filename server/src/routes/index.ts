import { Router } from "express"
import streamRouter from "./streamRouter"
import netpingRouter from "./netpingRouter"
import switchRouter from "./switchRouter"
import recordRouter from "./recordRouter"
import healthController from "../controllers/HealthController";
import tryCatch from "../utils/tryCatch";


const router = Router()
router.get('/ping', tryCatch(healthController.ping));
router.use('/stream', streamRouter) 
router.use('/netping', netpingRouter) 
router.use('/switch', switchRouter) 
router.use('/record', recordRouter) 


export default router
