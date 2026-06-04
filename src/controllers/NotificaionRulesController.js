const notificaionRulesModel = require("../models/NotificaionRulesModel")

const createNotificationRule = async (req,res) =>{
    try{
        const notificationRule = await notificaionRulesModel.create(req.body)
        res.status(201).json({
            message:"notification rule created..",
            data:notificationRule
        })
    }catch(err){
        res.status(500).json({
            message:"error while creating notification rule..",
            err:err
        })
    }
}

const getNotificationRules = async (req,res) =>{
    try{
        const notificationRules = await notificaionRulesModel.find()
        res.status(200).json({
            message:"notification rules fetched successfully..",
            data:notificationRules
        })
    }catch(err){
        res.status(500).json({
            message:"error while fetching notification rules..",
            err:err
        })
    }
}

module.exports = {
    createNotificationRule,
    getNotificationRules
}