const express = require("express")
const advancedResults = require("../middlewares/advancedResults")
const User = require("../models/User")
const { protect, authorize } = require("../middlewares/auth")

const router = express.Router({ mergeParams: true })
const { getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/users")

router.use(protect)
router.use(authorize("admin"))

router.route("/").get(advancedResults(User), getUsers).post(createUser)

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser)

module.exports = router
