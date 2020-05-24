const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")
const asyncHandler = require("../middlewares/async")

//Get All Users
//GET api/v1/auth/users
//Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

//Get Single User
//GET api/v1/auth/users/:id
//Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorResponse("ID not found", 400))
    }

    res.status(200).json({
        success: true,
        data: user,
    })
})

//Create User
//POST api/v1/auth/users
//Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body)

    res.status(201).json({
        success: true,
        data: user,
    })
})

//Update User
//PUT api/v1/auth/users/:id
//Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        data: user,
    })
})

//Delete User
//DELETE api/v1/auth/users/:id
//Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        data: {},
    })
})
