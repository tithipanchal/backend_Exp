const cloudinary = require("cloudinary").v2
require("dotenv").config()


const uploadFileToCloudinary = async(filePath)=>{

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET
    })

const cloudinaryResponse = await cloudinary.uploader.upload(filePath)
return cloudinaryResponse;


}


module.exports = uploadFileToCloudinary
