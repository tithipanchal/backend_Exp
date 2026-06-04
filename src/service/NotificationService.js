// const sendNotification = (audiance, message, time, type, channel) =>{

//     switch(type){
//         case "new_addmission":
//             // --> db -->entery notificationLogs
//             //{addiance:[{},{}<{<}{}]}
//             //mesaage:["new admision done"],
//             //time:["1 hour"]
//             //channel :["email"]
//             //new table store --> notifican Logs -->satus -->sent not sent
//             console.log("New admision done notification sent..")
//             console.log("Audiance : ",audiance)
//             console.log("Message : ",message)
//             console.log("Time : ",time)
//             console.log("Type : ",type)
//             console.log("Channel : ",channel)
//             break;
//     }
// }

const notificaionRulesModel = require("../models/NotificaionRulesModel")
const userModel = require("../models/UserModel")
const notificationLogsModel = require("../models/NotifiCationLogs")


const sendNotification = async (eventTrigger, data) => {
    try {
        // Query the active notification rule for the trigger event
        const rule = await notificaionRulesModel.findOne({
            triggerEvent: eventTrigger, 
            isActive: true
        }).populate("notification");

        if (!rule || !rule.notification) {
            console.log(`[NotificationService] No active notification rule or configuration found for trigger: "${eventTrigger}"`);
            return {
                status: "failed",
                message: `No active notification configuration found for trigger: ${eventTrigger}`
            };
        }

        // Save a log entry for this notification
        const saveNotificationLog = async () => {
            const log = await notificationLogsModel.create({
                notificationId: rule.notification._id,
                userId: data.userId,
                channel: rule.notification.channel,
                status: "PENDING"
            });
            return log;
        };

        const log = await saveNotificationLog();

        return {
            status: "success",
            message: "Notification saved successfully..",
            log
        };
    } catch (error) {
        console.error("[NotificationService] Error in sendNotification:", error);
        return {
            status: "error",
            message: error.message
        };
    }
}
module.exports = {sendNotification}