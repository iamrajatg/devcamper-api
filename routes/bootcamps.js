const express = require("express")
const advancedResults = require("../middlewares/advancedResults")
const { protect, authorize } = require("../middlewares/auth")
const Bootcamp = require("../models/Bootcamp")
const router = express.Router()
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload,
} = require("../controllers/bootcamps")

//Include Other Resources Routes
const courseRouter = require("./courses")
const reviewRouter = require("./reviews")

//Reroute into other resouces router
router.use("/:bootcampId/courses", courseRouter)
router.use("/:bootcampId/reviews", reviewRouter)

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius)

router
    .route("/")
    .get(advancedResults(Bootcamp, "courses"), getBootcamps)
    .post(protect, authorize("publisher", "admin"), createBootcamp)

router
    .route("/:id")
    .get(getBootcamp)
    .put(protect, authorize("publisher", "admin"), updateBootcamp)
    .delete(protect, authorize("publisher", "admin"), deleteBootcamp)

router.route("/:id/photo").put(protect, authorize("publisher", "admin"), bootcampPhotoUpload)

module.exports = router
