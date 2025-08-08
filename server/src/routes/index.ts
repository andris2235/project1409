import { Router } from "express"
import streamRouter from "./streamRouter"



const router = Router()

router.use('/stream', streamRouter) 



export default router