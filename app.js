const express = require("express")
const app = express()
app.use(express.json())

const cors = require("cors")
app.use(cors())


const userRoutes = require("./src/routes/UserRoutes")
app.use("/user",userRoutes)


const expCategoryRoutes = require("./src/routes/ExpCategoryRoutes")
app.use("/expenseCategory",expCategoryRoutes)

const expenseRoutes = require("./src/routes/ExpenseRoutes")
app.use("/exp",expenseRoutes)

const incomeCategoryRoutes = require("./src/routes/IncomeCategoryRoutes")
app.use("/incomeCat",incomeCategoryRoutes)

const budgetRoutes = require("./src/routes/BudgetRoutes")
app.use("/budget",budgetRoutes)

const notificationRoutes = require("./src/routes/NotificationRoutes")
app.use("/notification",notificationRoutes)

const notificationRulesRoutes = require("./src/routes/NotificaionRulesRoutes")
app.use("/notificationRule",notificationRulesRoutes)

//DBCONNECTION:
const DBConnection = require("./src/utils/DBConnection")
DBConnection()

//CRON JOBS INITIALIZATION:
const { initCronJobs } = require("./src/service/CronService")
initCronJobs()

//server creation..
const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started on port ${PORT}`)
})
