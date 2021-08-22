const usersCollection = require('../db').db().collection("users")
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
  return new Promise(async (resolve, reject) => {
    if (this.data.username == ""){this.errors.push("You must provide a username.")}
    if (this.data.username.length > 0 && this.data.username.length <3 ){this.errors.push("Username must be 3 characters")}
    if (this.data.username.length> 30){this.errors.push("Username can not exceed 30 characters")}
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)){this.errors.push("Username must be only numbers and alphabets")}
  
    if (!validator.isEmail(this.data.email)){this.errors.push("You must provide an email.")}
  
    if (this.data.password == ""){this.errors.push("You must provide a password.")}
    if (this.data.password.length > 0 && this.data.password.length <8 ){this.errors.push("Password must be 8 characters")}
    if (this.data.password.length> 50){this.errors.push("Password can not exceed 50 characters")}
  
    //only if username is valid then check to see if it's already taken
    if(this.data.username>2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)){
      let usernameExits = await usersCollection.findOne({username: this.data.username})
      if (usernameExits){this.errors.push("That username is already taken")}
    }
    //only if email is valid then check to see if it's already taken
    if(validator.isEmail(this.data.email)){
      let emailExits = await usersCollection.findOne({email: this.data.email})
      if (emailExits){this.errors.push("That email is already being use")}
    }
    resolve()
  })
}

User.prototype.login = function(){
  return new Promise((resolve, reject)=>{
    this.cleanUp()
    usersCollection.findOne({username: this.data.username}).then((attemptedUser)=>{
      if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
        resolve("congrats you are logged in!");
      } else {
        reject("invalid username/password");
      }
    }).catch(()=>{
      reject("Please try again")
    })
  })
}

// OLD CALLBACK METHOD
// User.prototype.login = function(callback){
//   this.cleanUp()
//   usersCollection.findOne({username: this.data.username}, (err, attemptedUser) => {
//     if(attemptedUser && attemptedUser.password == this.data.password){
//       callback("congrats you are logged in!");
//     } else {
//       callback("invalid username/password");
//     }
//   })
// }

User.prototype.register = function(){
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate Data
    this.cleanUp()
    await this.validate()
  
    // Step #2: Save the validated data
    if(!this.errors.length){
      //hash the password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

module.exports = User