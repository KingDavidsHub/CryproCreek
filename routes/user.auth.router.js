const express = require('express')
const router = express.Router()

const { signin, signup, verifyToken, isVerified, forgotPassWord, resendCode, resetPassword, changePassWord, updateUserInfo, deleteUserById, getUserById, getAllUsers} = require('../controllers/user.auth.controller')
const { protect, userRoleAuth } = require('../middleware/auth.middleware')
router.route('/signup').post(signup)
router.route('/signin').post(signin)
router.route('/verifyToken').post(verifyToken)
router.route('/isVerified/:userId').get(isVerified)
router.route('/forgotPassWord').post(forgotPassWord)
router.route('/getAllUsers').get(getAllUsers)
router.route('/resendCode').post(resendCode)
router.route('/changePassWord').post(protect, changePassWord)
router.route('/resetPassWord').put(resetPassword)
router.route('/deleteUserById/:userId').delete( protect,  deleteUserById)
router.route('/getUserById/:userId').get( /*protect, userRoleAuth,*/getUserById)
router.route('/updateUserInfo/:userId').put(protect, userRoleAuth,updateUserInfo)


module.exports = router;

