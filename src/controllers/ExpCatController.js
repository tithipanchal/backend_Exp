const expCategory = require("../models/ExpenseCategoryModel")
const createExpenseCategory = async (req, res) => {

    try {

        console.log("req.user...", req.user)
        //const savedExp = await expCategory.create(req.body) //tile,description,token
        const savedExp = await expCategory.create({ ...req.body, userId: req.user._id }) //tile,description,token 
        res.status(201).json({
            message: "expCat saved..",
            cat: savedExp
        })
    } catch (err) {
        res.status(201).json({
            message: "errow while saving expCat ",
            err: err
        })

    }
}

const getExpensecategoriesByUserId = async (req, res) => {

    try {

        const userId = req.user._id
        const categories = await expCategory.find({ userId: userId })
        
        res.status(200).json({
            message: "Expenses fetched successfully",
            data: categories
        })
    } catch (err) {
        
        res.status(500).json({
            message: "Error while fetching expenses",
            err: err
        })
    
    }

}

const deleteMyCategory = async(req,res)=>{
 
    try{
        const id = req.params.id
        await expCategory.findByIdAndDelete(id)
        res.status(200).json({
            message: "category deleted..",
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: "error while deleting category..",
            err: err
        })
    }
    
}

module.exports = {
    createExpenseCategory,
    getExpensecategoriesByUserId,
    deleteMyCategory
}