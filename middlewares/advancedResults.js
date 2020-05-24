const advancedResults = (model, populate) => async (req, res, next) => {
    let query

    const reqQuery = { ...req.query }

    //Fields to remove
    const removeFields = ["select", "sort", "page", "limit"]

    //Loop Over remove fields and delete them from reqQuery
    removeFields.forEach((field) => delete reqQuery[field])

    let queryStr = JSON.stringify(reqQuery)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)
    query = model.find(JSON.parse(queryStr))

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
    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    if (populate) {
        query - query.populate(populate)
    }

    const results = await query

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

    res.advancedResults = {
        success: true,
        length: results.length,
        pagination,
        data: results,
    }

    next()
}

module.exports = advancedResults
