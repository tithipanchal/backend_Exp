
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        trim:true
    },
    password:{
        type:String
    },
    age:{
        type:Number
    },
    gender:{
        type:String,
        enum:["Male","Female"]
    },
    profilePic:{
        type:String
    },
    status:{
        type:String,
        enum:["Active","Not Active"],
        default:"Active"
    },
    otp:{
        type:Number
    }
},{timestamps:true})


module.exports =mongoose.model("users",userSchema)