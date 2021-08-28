const Post = require('../models/Post')
const sendgrid = require('@sendgrid/mail')
sendgrid.setApiKey(process.env.SENDGRIDAPIKEY)

exports.viewCreateScreen = function(req, res) {
  res.render('create-post')
}

exports.create = function(req, res){
  let post = new Post(req.body, req.session.user._id)
  post.create().then(function(newId) {
    sendgrid.send({
      to:'eprafull@gmail.com',
      from:'test@test.com',
      subject: 'Congrats on creating new post',
      html: 'You did a <strong>Great</strong> job.'
    }).then(()=>{}, error =>{
      console.error(error);
      if (error.response){
        console.error(error.response.body);
      }
    })
    req.flash("success", "New post successfully created.")
    req.session.save(()=>res.redirect(`/post/${newId}`))
  }).catch(function(err) {
    errors.forEach(error=>req.flash("errors", error))
    res.session.save(()=>res.redirect("/create-post"))
  })
}

exports.viewSingle = async function(req, res){
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    res.render('single-post-screen', {post: post, title: post.title})
  } catch {
    res.render('404')
  }
}


exports.viewEditScreen = async function(req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    if (post.isVisitorOwner) {
      res.render("edit-post", {post: post})
    } else {
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(() => res.redirect("/"))
    }
  } catch {
    res.render("404")
  }
}

exports.edit = function(req, res){
  let post = new Post(req.body, req.visitorId, req.params.id)
  post.update().then((status)=>{
    //successfully or unsuccessful updated
    if(status == "success"){
      //post updated in db
      req.flash("success", "Post successfully updated.")
      req.session.save(function(){
        res.redirect(`/post/${req.params.id}/edit`)
      })
    } else {
      //validation error
      post.errors.forEach(function(error){
        req.flash("errors", error)
      })
      req.session.save(function(){
        res.redirect(`/post/${req.params.id}/edit`)
      })
    }

  }).catch(()=>{
    //doesn't exist
    //not owner
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(function(){
      res.redirect('/')
    })
  })
}

exports.delete = function(req, res){
  Post.delete(req.params.id, req.visitorId).then(()=>{
    req.flash("success", "Post successfully deleted.")
    req.session.save(()=>res.redirect(`/profile/${req.session.user.username}`))
  }).catch(()=>{
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(()=>res.redirect('/'))
  })
}

exports.search = function(req, res){
  Post.search(req.body.searchTerm).then(posts=>{
    res.json(posts)
  }).catch(()=>{
    res.json([])
  })
}