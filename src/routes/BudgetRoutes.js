const router = require("express").Router()
const budgetController = require("../controllers/BudgetController")
const authMiddleware = require("../middleware/AuthMiddleware")

router.post("/",authMiddleware,budgetController.createBudget)
router.get("/",authMiddleware,budgetController.getMyBudget)
router.delete("/:id",authMiddleware,budgetController.deleteMyBudget)
router.put("/:id",authMiddleware,budgetController.updateMyBudget)

module.exports = router