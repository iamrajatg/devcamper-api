const Bootcamp = require("../models/Bootcamp")
const ErrorResponse = require("../utils/errorResponse")
const geocoder = require("../utils/geoCoder")
const asyncHandler = require("../middlewares/async")
const path = require("path")

exports.getBootcamps = asyncHandler(async (req, res, next) => {
    console.log(req.query)
    let query

    const reqQuery = { ...req.query }

    //Fields to remove
    const removeFields = ["select", "sort", "page", "limit"]

    //Loop Over remove fields and delete them from reqQuery
    removeFields.forEach((field) => delete reqQuery[field])

    let queryStr = JSON.stringify(reqQuery)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)
    query = Bootcamp.find(JSON.parse(queryStr))

    //Select Fields
    if (req.query.select) {
        query = query.select(req.query.select.split(",").join(" "))
    }

    //Sort Fields
    if (req.query.sort) {
        query = query.sort(req.query.sort.split(",").join(" "))
    } else {
        query = query.sort("-createdAt")
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()

    query = query.skip(startIndex).limit(limit).populate("courses")

    const bootcamps = await query

    //Pagination Result
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit,
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination,
        data: bootcamps,
    })
})
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        return next(new ErrorResponse("ID not found", 400))
    }
    res.status(200).json({
        success: true,
        data: bootcamp,
    })
})

exports.createBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = new Bootcamp(req.body)
    //const bootcamp = await Bootcamp.create(req.body)
    bootcamp = await bootcamp.save()
    res.status(201).json({
        success: true,
        data: bootcamp,
    })
})

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })
    if (!bootcamp) {
        return next(new ErrorResponse("ID not found", 400))
    }
    res.status(200).json({
        success: true,
        data: bootcamp,
    })
})

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse("ID not found", 400))
    }

    await bootcamp.remove()
    res.status(200).json({
        success: true,
        data: {},
    })
})

//@desc Get Bootcamps Within Radius
//@route GET api/v1/bootcamps/radius/:zipcode/:distance
//@access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    //Get Latitude and Longitude from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    //Calc radius using radians
    //Divide distance by fradius of Earth
    //Earth Radius = 3,963 mi,6,378 km

    const unit = "mi" //or km
    const earthRadius = 3963

    if (unit === "km") {
        earthRadius = 6378
    }
    const radius = distance / earthRadius

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] },
        },
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    })
})

//upload photo for bootcamp
//PUT api/v1/bootcamps/:id/photo
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse("ID not found", 400))
    }

    if (!req.files) {
        return next(new ErrorResponse("Please upload a file", 400))
    }

    const file = req.files.file

    //Make sure uploaded file is image
    if (!file.mimetype.startsWith("image")) {
        return next(new ErrorResponse("Please upload an Image file", 400))
    }

    //Check File Size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an Image of Max Size - ${process.env.MAX_FILE_UPLOAD} bytes `,
                400
            )
        )
    }

    //Create Custom Filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
            console.log(err)
            return next(new ErrorResponse(`Problem with File Upload`, 500))
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

        res.status(200).json({
            success: true,
            data: file.name,
        })
    })

    console.log(req.files)
})
