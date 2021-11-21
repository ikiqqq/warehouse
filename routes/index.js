const express = require('express')
const router = express.Router()
const adminsRouter = require('./admins')
// const moviesRouter = require('./moviesRoute')
// const genresRouter = require('./genre')

router.use('/admin', adminsRouter)
// router.use('/v1/watchlist', watchlistRouter)
// router.use('/v1/users', usersRouter)

module.exports = router
