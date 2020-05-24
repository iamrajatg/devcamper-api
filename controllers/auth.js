const User = require("../models/User")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middlewares/async")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")

//Register User
//POST api/v1/auth/register
//Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body
    const user = new User({ name, email, password, role })

    await user.save()

    sendTokenResponse(user, 200, res)
})

//Login User
//POST api/v1/auth/login
//Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorResponse("Please Provide an email and password", 400))
    }
    const user = await User.findOne({ email: email }).select("+password")

    if (!user) {
        return next(new ErrorResponse("Please Enter Valid Credentials", 401))
    }

    //check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
        return next(new ErrorResponse("Please Enter Valid Credentials", 401))
    }

    sendTokenResponse(user, 200, res)
})

//Logout User

exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        data: {},
    })
})

//Get the current logged in user

exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user,
    })
})

//@desc Update User Details
//@route PUT /api/v1/auth/updatedetails
//@access PRIVATE

exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name ? req.body.name : req.user.name,
        email: req.body.email ? req.body.email : req.user.email,
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        data: user,
    })
})

//@desc Update Password
//@route PUT /api/v1/auth/updatepassword
//@access PRIVATE

exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    //Check Current Password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse("Password is incorrect", 401))
    }

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res)
})

//@desc FORGOT PASSWORD
//@route POST /api/v1/auth/forgotPassword
//@access Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorResponse("There is no user with that email", 404))
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    //Create Reset URL
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/forgotpassword/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of password .Please make a PUT request to \n\n ${resetUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: "Devcamper Password Reset",
            message,
        })

        res.status(200).json({
            success: true,
            data: "Email Sent",
        })
    } catch (error) {
        console.log(err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({
            validateBeforeSave: false,
        })

        return next(new ErrorResponse("Email could not be sent", 500))
    }
})

//@desc RESET PASSWORD
//@route PUT /api/v1/auth/forgotPassword/:resettoken
//@access Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
        return next(new ErrorResponse("Invalid Token0", 400))
    }

    //Set New Password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendTokenResponse(user, 200, res)
})

//Get token from model,create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create Token
    const token = user.getSignedJwtToken()
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }

    if (process.env.NODE_ENV === "production") {
        options.secure = true
    }

    res.status(statusCode).cookie("token", token, options).json({ success: true, token })
}
