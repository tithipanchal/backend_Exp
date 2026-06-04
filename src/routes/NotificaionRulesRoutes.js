const router = require("express").Router()
const notificaionRulesController = require("../controllers/NotificaionRulesController")

router.post("/",notificaionRulesController.createNotificationRule)
router.get("/",notificaionRulesController.getNotificationRules)

module.exports = router