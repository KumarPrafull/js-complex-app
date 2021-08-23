const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')
const app = express()


let sessionOptions =session({
  secret: "Javascript is so cool",
  store: new MongoStore({client: require('./db')}),
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000*60*60*12, httpOnly: true}
})

app.use(sessionOptions)
app.use(flash())

app.use(function(req, res, next){
  //make our markdown function available withing ejs templates
  res.locals.filterUserHTML = function(content) {
    return sanitizeHTML(markdown(content), {allowedTags:['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4','h5','h6'], allowedAttributes:[]})
  }
  //make all error and success message available from all templates
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")

  //make current user id available to the req object
  if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}

  //make user session data available from within view templates
  res.locals.user = req.session.user
  next()
})

const router = require('./router')

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.set('views', 'views')
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use('/', router)

module.exports = app