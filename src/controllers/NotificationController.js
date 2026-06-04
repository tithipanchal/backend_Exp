const notificationModel = require("../models/NotificationModel")

const createNotification= async (req,res) =>{
    try{
        const notification = await notificationModel.create(req.body)
        res.status(201).json({
            message:"notification created..",
            data:notification
        })
    }catch(err){
        res.status(500).json({
            message:"error while creating notification..",
            err:err
        })
    }
}

const getNotifications = async (req,res) =>{
    try{
        const notifications = await notificationModel.find()
        res.status(200).json({
            message:"notifications fetched successfully..",
            data:notifications
        })
    }catch(err){
        res.status(500).json({
            message:"error while fetching notifications..",
            err:err
        })
    }
}


module.exports = {
    createNotification,
    getNotifications
}