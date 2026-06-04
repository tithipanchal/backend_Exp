const router = require("express").Router()
const expenseController = require("../controllers/ExpenseController")
const authMiddleware = require("../middleware/AuthMiddleware")
const uploadMiddleware = require("../middleware/UploadMiddleware")

router.post("/",authMiddleware,expenseController.createExpense)
router.get("/expbyuserid",authMiddleware,expenseController.getExpesneByUserId)
router.delete("/:id",authMiddleware,expenseController.deleteMyExpense)

router.get("/search",authMiddleware,expenseController.serachExpesneByUserId)

router.put("/uploadreceipt",authMiddleware,uploadMiddleware.single("receipt"),expenseController.uploadExpenseReceipt)

module.exports = router
