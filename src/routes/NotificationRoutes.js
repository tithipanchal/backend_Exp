const router = require("express").Router()
const notificationController = require("../controllers/NotificationController")

router.post("/",notificationController.createNotification)
router.get("/",notificationController.getNotifications)

module.exports = router