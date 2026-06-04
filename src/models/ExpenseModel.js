const mongoose = require("mongoose")
const Schema = mongoose.Schema

const expenseSchema = new Schema({
    title:{
        type:String
    },
    amount:{
        type:Number
    },
    expCategory:{
        type:Schema.Types.ObjectId,
        ref:"expCategory"
    },
    expenseDate:{
        type:Date,
        default:new Date()
    },
    description:{
        type:String
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
    expReceipt:{
        type:String
    },
    paymentMode:{
        type:String,
        enum:["UPI","CASH","CARD","CHECK","EMI"]
    },
    income:{
        type:Number
    },
    incomeCategory:{
        type:Schema.Types.ObjectId,
        ref:"incomeCategory"
    }
    
},{timestamps:true})


module.exports = mongoose.model("expenses",expenseSchema)
