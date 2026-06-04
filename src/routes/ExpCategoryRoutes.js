const router = require("express").Router()
const categoryController = require("../controllers/ExpCatController")
const authMiddleware =require("../middleware/AuthMiddleware")

router.post("/",authMiddleware,categoryController.createExpenseCategory)
router.get("/get",authMiddleware,categoryController.getExpensecategoriesByUserId)
router.delete("/:id",authMiddleware,categoryController.deleteMyCategory)

module.exports = router