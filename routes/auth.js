const express = require("express")

const {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
} = require("../controllers/auth")
const { protect } = require("../middlewares/auth")

const router = express.Router()

router.post("/register", register)

router.post("/login", login)

router.get("/me", protect, getMe)

router.get("/logout", protect, logout)

router.put("/updatedetails", protect, updateDetails)

router.put("/updatepassword", protect, updatePassword)

router.post("/forgotpassword", forgotPassword)

router.put("/forgotpassword/:resettoken", resetPassword)

module.exports = router
