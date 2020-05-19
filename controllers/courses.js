const Course = require("../models/Course")
const asyncHandler = require("../middlewares/async")
const ErrorResponse = require("../utils/errorResponse")
const Bootcamp = require("../models/Bootcamp")

// GET api/v1/courses
// GET api/v1/bootcamps/:bootcampId/courses
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId })
    } else {
        query = Course.find().populate({
            path: "bootcamp",
            select: "name description",
        })
    }

    const courses = await query

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    })
})

// GET api/v1/courses/:id
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description",
    })

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: course,
    })
})

// POST api/v1/bootcamps/:bootcampId/courses
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(new ErrorResponse(`No Boootcamp with id of ${req.params.bootcampId}`, 404))
    }

    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course,
    })
})

// PUT api/v1/courses/:id
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: course,
    })
})

// DELETE api/v1/courses/:id
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404))
    }

    await course.remove()

    res.status(200).json({
        success: true,
        data: {},
    })
})
