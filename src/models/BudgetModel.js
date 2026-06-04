const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const budgetSchema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
    maxAmount:{
        type:Number
    },
    createdDate:{
        type:Date,
        default:Date.now()
    },
    endDate:{
        type:Date
    },
    exceededDate:{
        type:Date
    },
    budgetStatus:{
        type:String,
        enum:["Active","Not Active"],
        default:"Active"
    }
    
})
module.exports = mongoose.model("budget",budgetSchema)  