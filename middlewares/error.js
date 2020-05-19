const ErrorResponse = require("../utils/errorResponse")
const util = require("util")
const errorHandler = (err, req, res, next) => {
    let error = { ...err }
    console.log(err)
    error.message = err.message

    //Log to console for dev
    console.log(err.stack)

    if (err.name === "CastError") {
        const message = `Bootcamp not found with id - ${err.value}`
        error = new ErrorResponse(message, 404)
    }

    //Mongoose Duplicate key Error

    if (err.code === 11000) {
        const message = `Duplicate field value entered`
        error = new ErrorResponse(message, 400)
    }

    //Validation Errors
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((val) => val.message)
        //console.log(message)
        error = new ErrorResponse(message, 400)
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error",
    })
}

module.exports = errorHandler
