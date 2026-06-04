const mongoose = require("mongoose")
const Schema = mongoose.Schema
const notificationModel = new Schema({
    name:{type:String, required:true},
    title:{type:String},
    channels:[
        {
            type:String,
            enum:["PUSH","EMAIL","SMS",'WHATSAPP']
        }
    ],
    trigger:{type:String},
    isActive:{
        type:Boolean,
        default:true
    },
    
}, {timestamps:true})
module.exports = mongoose.model('Notification', notificationModel)

//{name:"EXP_CREATED_NOTIFICATION",title:"Expense Created",channels:["EMAIL"], trigger:1,isActive:true}