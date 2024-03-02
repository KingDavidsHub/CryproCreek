const express = require('express')
const router = express.Router()

const { signin, signup, verifyToken, isVerified, forgotPassWord, resendCode, resetPassword, changePassWord} = require('../controllers/user.auth.controller')
const { protect, userRoleAuth } = require('../middleware/auth.middleware')
router.route('/signup').post(signup)
router.route('/signin').post(signin)
router.route('/verifyToken').post(verifyToken)
router.route('/isVerified/:userId').get(isVerified)
router.route('/forgotPassWord').post(forgotPassWord)
router.route('/resendCode').post(resendCode)
router.route('/changePassWord').post(protect, changePassWord)
router.route('/resetPassWord').put(resetPassword)


module.exports = router;