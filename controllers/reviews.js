const Review = require("../models/Review")
const asyncHandler = require("../middlewares/async")
const ErrorResponse = require("../utils/errorResponse")
const Bootcamp = require("../models/Bootcamp")

//Get Reviews
// GET api/v1/reviews
// GET api/v1/bootcamps/:bootcampId/reviews
//Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId })

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})

//Get Single Review
// GET api/v1/reviews/:id
//Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description",
    })

    if (!review) {
        return next(new ErrorResponse(`No review with id of ${req.params.id}`, 404))
    }

    return res.status(200).json({
        success: true,
        data: review,
    })
})

//Add Review
// POST api/v1/bootcamps/:bootcampId/reviews
//PRIVATE
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp with id of ${req.params.bootcampId}`, 404))
    }

    const review = await Review.create(req.body)

    return res.status(201).json({
        success: true,
        data: review,
    })
})

//Update Review
// PUT api/v1/bootcamps/reviews/:id
//PRIVATE
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id)

    if (!review) {
        return next(new ErrorResponse(`No review with id of ${req.params.id}`, 404))
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `User with id of ${req.user.id} is not authorized to update this review`,
                401
            )
        )
    }

    review.title = req.body.title || review.title
    review.text = req.body.text || review.text
    review.rating = req.body.rating || review.rating

    await review.save()

    // review = await Review.findOneAndUpdate({ _id: req.params.id }, req.body, {
    //     new: true,
    //     runValidators: true,
    // })

    return res.status(200).json({
        success: true,
        data: review,
    })
})

//Delete Review
// DELETE api/v1/bootcamps/reviews/:id
//PRIVATE
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id)

    if (!review) {
        return next(new ErrorResponse(`No review with id of ${req.params.id}`, 404))
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(
                `User with id of ${req.user.id} is not authorized to delete this review`,
                401
            )
        )
    }

    await review.remove()

    return res.status(200).json({
        success: true,
        data: {},
    })
})
