const express = require("express")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const errorHandler = require("./middlewares/error")
const morgan = require("morgan")
const fileupload = require("express-fileupload")
const path = require("path")
const cookieParser = require("cookie-parser")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const xssClean = require("xss-clean")
const rateLimit = require("express-rate-limit")
const hpp = require("hpp")
const cors = require("cors")

//Load env vars
dotenv.config({ path: "./config/config.env" })

//Import Route files
const bootcamps = require("./routes/bootcamps")
const courses = require("./routes/courses")
const auth = require("./routes/auth")
const users = require("./routes/users")
const reviews = require("./routes/reviews")

//Conect to DB
connectDB()

const app = express()

const PORT = process.env.PORT || 5000

//BODY PARSER
app.use(express.json())

//COOKIE PARSER
app.use(cookieParser())

//Dev Logging Middleware
if (process.env.NODE_ENV === "development") app.use(morgan("dev"))

//File Uploading Middleware
app.use(fileupload())

//Sanitize Input
app.use(mongoSanitize())

//Add security headers
app.use(helmet())

//XSS-CLEAN input
app.use(xssClean())

//Rate Limiting
app.use(
    rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100,
    })
)

//Prevent Http param pollution
app.use(hpp())

//Enable CORS
app.use(cors())

//Set Static folder
app.use(express.static(path.join(__dirname, "public")))

//Mount Routers
app.use("/api/v1/bootcamps", bootcamps)
app.use("/api/v1/courses", courses)
app.use("/api/v1/auth", auth)
app.use("/api/v1/users", users)
app.use("/api/v1/reviews", reviews)

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
