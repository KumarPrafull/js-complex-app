const { response } = require('../app')
const User = require('../models/user')

exports.login = function(req, res){
  let user = new User(req.body)
  user.login().then(function(result){
    req.session.user = {favColor: 'blue', username: user.data.username}
    req.session.save(function(){
      res.redirect("/")
    })
  }).catch(function(err){
    req.flash('errors', err)
    //above line does req.session.flash.errors = [e]
    req.session.save(function(){
      res.redirect('/')
    })
  })
  //OLD CALLBACK METHOD
  // user.login(function(result){
  //   res.send(result)
  // })
}

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/')
  })
}

exports.register = function(req, res){
  let user = new User(req.body)
  user.register().then(()=>{
    req.session.user = {username: user.data.username}
    req.session.save(function(){
      res.redirect('/')
    })
  }).catch((regErrors)=>{
    regErrors.forEach(function(error){
      req.flash('regErrors', error)
    })
    req.session.save(function(){
      res.redirect('/')
    })
  })
} 

exports.home = function(req, res){
if (req.session.user){
  res.render("home-dashboard", {username: req.session.user.username})
} else {
  res.render("home-guest", {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
}
}