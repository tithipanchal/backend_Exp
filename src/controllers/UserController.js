const userSchema = require("../models/UserModel")
const bcrypt = require("bcrypt")
const mailSend = require("../utils/MailUtil")
const jwt = require("jsonwebtoken")
const uploadFileToCloudinary = require("../utils/CloudinaryUtil")
const secret = "secret"


const createUser = async (req, res) => {
  console.log(req.body);
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const userData = { ...req.body, password: hashedPassword };

  // If profilePic comes in as an empty object `{}`, delete it to prevent CastError
  if (userData.profilePic && typeof userData.profilePic === "object") {
    delete userData.profilePic;
  }

  try {
    const savedUser = await userSchema.create(userData);
    //mail..
    await mailSend(
      savedUser.email,
      "Welcome Mail",
      "Welcome to expense manager app",
    );
    if (savedUser) {
      res.status(201).json({
        message: "user created..",
      });
    } else {
      res.status(500).json({
        message: "user not created..",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error while creating user..",
    });
  }
};
const getAllUsers = async (req, res) => {
  const query = req.query
  try {
    const users = await userSchema.find(query);
    res.status(200).json({
      message: "users",
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      message: "error while ferching user",
      err: err,
    });
  }
};
const deleteUser = async (req, res) => {
  const id = req.params.id
  try {
    const deletedUser = await userSchema.findByIdAndDelete(id)
    if (deletedUser) {
      res.status(200).json({
        message: "user deleted..",
        data: deletedUser
      });
    } else {
      res.status(404).json({
        message: "user not found..",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "error while deleting user..",
      err: err,
    });
  }
};

const loginUser = async (req, res) => {

  const { email, password } = req.body
  try {

    const foundUserFromEmail = await userSchema.findOne({ email })
    console.log(foundUserFromEmail)
    if (foundUserFromEmail) {

      //compare encrypted and plain passwoerd
      if (bcrypt.compareSync(password, foundUserFromEmail.password)) {
        //token generate..
        const token = jwt.sign(foundUserFromEmail.toObject(), secret)
        res.status(200).json({
          message: "user logged in..",
          // data:foundUserFromEmail,
          token: token
        })
      } else {
        res.status(401).json({
          message: "invalid credentials",
        })
      }
    } else {
      res.status(404).json({
        message: "user not found..",
      })
    }
  } catch (err) {
    res.status(500).json({
      message: "error while logging in..",
      err: err
    })
  }

}


const getUserById = async (req, res) => {

  const userId = req.user._id
  const foundUser = await userSchema.findById(userId)
  if (foundUser) {
    res.status(200).json({
      message: "user found..",
      user: foundUser
    })
  }

  else {
    res.status(404).json({
      message: "user not found..",
    })
  }

}

const uploadProfilePic = async (req,res) =>{

  try{
    const userId = req.user._id
    const file = req.file

    if (!file) {
        return res.status(400).json({
            message: "No file uploaded"
        })
    }

    const user = await userSchema.findById(userId)
    if(user){
      const cloudinaryResponse = await uploadFileToCloudinary(file.path)
      user.profilePic = cloudinaryResponse.secure_url
      await user.save()
      res.status(200).json({
        message: "profile picture uploaded successfully..",
        user: user
      })
    }else{
      res.status(404).json({
        message: "user not found..",
      })
    }
  }
  catch(err){
    console.error("Cloudinary upload error:", err);
    res.status(500).json({
      message: "error while uploading profile picture..",
      err: err.message || err
    })
  }

}

// forgot password
const forgotPassword = async (req, res) => {

  const { email } = req.body
  const user = await userSchema.findOne({ email })
  if (user) {
    const otp = Math.floor(1000 + Math.random() * 9000)
    user.otp = otp
    await user.save()
    await mailSend(email, "Forgot Password", `Your OTP is ${otp}`)
    res.status(200).json({
      message: "OTP sent successfully..",
    })
  } else {
    res.status(404).json({
      message: "user not found..",
    })
  }

}

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body
  try {
    const user = await userSchema.findOne({ email })
    if (!user) {
      return res.status(404).json({
        message: "user not found..",
      })
    }

    if (!user.otp || Number(user.otp) !== Number(otp)) {
      return res.status(400).json({
        message: "invalid OTP..",
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.otp = undefined
    await user.save()

    res.status(200).json({
      message: "password reset successfully..",
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "error while resetting password..",
      err: err.message || err,
    })
  }
}

module.exports = {

  createUser,
  getAllUsers,
  deleteUser,
  loginUser,
  getUserById,
  uploadProfilePic,
  forgotPassword,
  resetPassword 

}

