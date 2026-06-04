const mongoose = require("mongoose")
const expenseModel = require("../models/ExpenseModel")
const uploadFileToCloudinary = require("../utils/CloudinaryUtil")
const {sendNotification} = require("../service/NotificationService")

const createExpense = async (req, res) => {
    try {
        const userId = req.user._id
        const expenseData = { ...req.body, userId: userId }

        if (expenseData.expCategory && !mongoose.Types.ObjectId.isValid(expenseData.expCategory)) {
            return res.status(400).json({
                message: "Invalid expense category id"
            })
        }

        const savedExpense = await expenseModel.create(expenseData)
        // sendNotification(req.user,["expenditure added successfully"],0,"expenditure_added","email")
        sendNotification("expense_created",savedExpense)
        res.status(201).json({
            message: "Expense created successfully",
            data: savedExpense
        })
    } catch (err) {
        res.status(500).json({
            message: "Error while creating expense",
            err: err.message
        })
        console.log(err);
    }
}

const getExpesneByUserId = async (req, res) => {

    try {

        const userId = req.user._id
        var sort = req.query.sort || 1;
        sort = parseInt(sort);
        var datesort = req.query.date || 1
        datesort = parseInt(datesort);
        console.log(datesort)
        const type = req.query.type || "expense"
        let expenses;

        if (type == "expense") {
            expenses = await expenseModel.find({ userId: userId, income: { $exists: false } }).select(["title", "description", "amount", "expenseDate", "paymentMode", "expCategory"]).sort({ amount: sort, createdAt: sort }).populate("expCategory")
        } else {
            expenses = await expenseModel.find({ userId: userId, income: { $exists: true } }).select(["title", "description", "income", "expenseDate", "paymentMode", "incomeCategory"]).sort({ income: sort, createdAt: sort }).populate("incomeCategory")
        }
        res.status(200).json({
            message: "Expenses fetched successfully",
            data: expenses
        })
    } catch (err) {
        res.status(500).json({
            message: "Error while fetching expenses",
            err: err
        })
    }
}

const deleteMyExpense = async (req, res) => {
    await expenseModel.findByIdAndDelete(req.params.id)

    try {
        res.status(201).json({
            message: "expense deleted successfully",
            data: expenseModel
        })
    }
    catch (err) {
        res.status(500).json({
            message: "expense is not deleted",
            err: err
        })
    }
}

const serachExpesneByUserId = async (req, res) => {

    const userId = req.user._id
    const expName = req.query.expName || ""
    var expAmount = req.query.expAmount || ""
    const type = req.query.type || "expense"
    var query = { userId: userId }

    if (type === "expense") {
        query.income = { $exists: false }
    } else {
        query.income = { $exists: true }
    }

    if (expAmount) {
        expAmount = parseInt(expAmount)
        if (type === "expense") {
            query.amount = expAmount
        } else {
            query.income = expAmount
        }
    }

    if (expName) {
        query.$or = [
            { title: { $regex: expName, $options: "i" } },
            { description: { $regex: expName, $options: "i" } }
        ]
    }

    try {
        const expenses = await expenseModel.find(query).populate(type === "expense" ? "expCategory" : "incomeCategory")

        res.status(200).json({
            message: "Expenses searched successfully",
            data: expenses
        })
    } catch (err) {
        res.status(500).json({
            message: "expense is not searched",
            err: err
        })
    }
}

const uploadExpenseReceipt = async (req, res) => {

    const expId = req.body.expId || req.body.expenseId
    const file = req.file

    if (!expId) {
        return res.status(400).json({
            message: "Expense ID is required"
        })
    }

    if (!file) {
        return res.status(400).json({
            message: "File is required"
        })
    }

    try {
        const cloudinaryResponse = await uploadFileToCloudinary(file.path)
        const updateExp = await expenseModel.findByIdAndUpdate(expId, { expReceipt: cloudinaryResponse.secure_url })
        res.status(200).json({
            message: "Expense receipt uploaded successfully",
            data: updateExp
        })
    } catch (err) {
        res.status(500).json({
            message: "Expense receipt is not uploaded",
            err: err.message
        })
    }
}

module.exports = {
    createExpense,
    getExpesneByUserId,
    deleteMyExpense,
    serachExpesneByUserId,
    uploadExpenseReceipt

}