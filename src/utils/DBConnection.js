const mongoose = require("mongoose")

const DBConnection = ()=>{

    mongoose.connect(process.env.MONGODB_URI).then(()=>{
        console.log("database conneced..")
    }).catch((err)=>{
        console.log("error while connecting db..",err)
    })

}

module.exports = DBConnection