const express = require("express")

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

//Reroute into other resouces router
router.use("/:bootcampId/courses", courseRouter)

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius)

router.route("/").get(getBootcamps).post(createBootcamp)

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

router.route("/:id/photo").put(bootcampPhotoUpload)

module.exports = router
