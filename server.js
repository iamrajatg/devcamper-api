const express = require("express")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const errorHandler = require("./middlewares/error")
const morgan = require("morgan")
const fileupload = require("express-fileupload")
const path = require("path")
//Load env vars
dotenv.config({ path: "./config/config.env" })

//Import Route files
const bootcamps = require("./routes/bootcamps")
const courses = require("./routes/courses")

//Conect to DB
connectDB()

const app = express()

const PORT = process.env.PORT || 5000

//BODY PARSER
app.use(express.json())

//Dev Logging Middleware
if (process.env.NODE_ENV === "development") app.use(morgan("dev"))

//File Uploading Middleware
app.use(fileupload())

//Set Static folder
app.use(express.static(path.join(__dirname, "public")))

//Mount Routers
app.use("/api/v1/bootcamps", bootcamps)
app.use("/api/v1/courses", courses)

app.use(errorHandler)

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, Promise) => {
    console.log(`Error:${err.message}`)
    //close server and exit process
    server.close(() => process.exit(1))
})
