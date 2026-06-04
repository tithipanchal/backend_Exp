const multer = require("multer")
const storage = multer.diskStorage({
    destination:"./uploads",
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const upload = multer({ 
    storage: storage, 
    fileFilter:(req, file,cb) =>{
        if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
            cb(null, true)
        }else{
            console.log("req.file.mimetype",file.mimetype)
            cb(new Error("Invalid file type"))
        }
    }
});

module.exports = upload;