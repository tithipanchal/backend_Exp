const mongoose = require("mongoose")
const Schema = mongoose.Schema
const NotificationLogSchema = new Schema({
    
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    notificationId:{
        type:Schema.Types.ObjectId,
        ref:'Notification',
        required:true
    },
    channel:{
        type:String,
        enum:["PUSH","EMAIL","SMS","WHATSAPP"]
    },
    status:{
        type:String,
        enum:["PENDING","SENT","FAILED"],
        default:"PENDING"
    },
    error:{
        type:String
    },
    sentAt:{
        type:Date
    }
}, {timestamps:true})
//userId,notificationId,channel,status,error,sentAt
module.exports = mongoose.model('NotificationLog',NotificationLogSchema)