const usersCollection = require('../db').collection("users")
const validator = require('validator')

let User = function(data){
  this.data = data
  this.errors =[]
}

User.prototype.cleanUp = function(){
  if(typeof(this.data.username) != "string"){this.data.username=""}
  if(typeof(this.data.email) != "string"){this.data.email=""}
  if(typeof(this.data.password) != "string"){this.data.password=""}

  //get rid of any bogus properties
  this.data= {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  }
}

User.prototype.validate = function(){
  if (this.data.username == ""){this.errors.push("You must provide a username.")}
  if (this.data.username.length > 0 && this.data.username.length <3 ){this.errors.push("Username must be 3 characters")}
  if (this.data.username.length> 30){this.errors.push("Username can not exceed 30 characters")}
  if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)){this.errors.push("Username must be only numbers and alphabets")}

  if (!validator.isEmail(this.data.email)){this.errors.push("You must provide an email.")}

  if (this.data.password == ""){this.errors.push("You must provide a password.")}
  if (this.data.password.length > 0 && this.data.password.length <8 ){this.errors.push("Password must be 8 characters")}
  if (this.data.password.length> 100){this.errors.push("Password can not exceed 100 characters")}

}

User.prototype.login = function(callback){
  this.cleanUp()
  usersCollection.findOne({username: this.data.username}, (err, attemptedUser) => {
    if(attemptedUser && attemptedUser.password == this.data.password){
      callback("congrats you are logged in!");
    } else {
      callback("invalid username/password");
    }
  })
}

User.prototype.register = function(){
  // Step #1: Validate Data
  this.cleanUp()
  this.validate()

  // Step #2: Save the validated data
  if(!this.errors.length){
    usersCollection.insertOne(this.data)
  }
}

module.exports = User