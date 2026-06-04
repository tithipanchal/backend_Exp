const mongoose = require("mongoose")
const Schema = mongoose.Schema


const NotificationRuleSchema =new Schema({
    notification:{
        type:Schema.Types.ObjectId,
        ref:'Notification',
        required:true
    },
    
    triggerEvent :{
        type:String,
        required:true
    },
    audiance:{
        type:String,
        enum:["ALL_USERS","ADMIN","USER"]
    },
    isActive:{
        type:Boolean,
        default:true
    },
   

})
//{notification:id,triggerEvent:"EXPENSE_CREATED",audiance:"ALL_USERS",isActive:true}
module.exports = mongoose.model('NotificationRule',NotificationRuleSchema)