import express from 'express'
import { deleteStaff, loginStaff, registerUser, updateStaff } from '../controllers/staffController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginStaff)
router.put('/:id', updateStaff)
router.delete('/:id', deleteStaff)

export default router