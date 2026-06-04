const budgetSchema = require("../models/BudgetModel")

const createBudget = async (req, res) => {

    try {

        console.log("req.user...", req.user)
        
        const existingBudget = await budgetSchema.findOne({ userId: req.user._id });
        if (existingBudget) {
            return res.status(400).json({
                message: "Budget already exists for this user. You cannot create another one.",
            });
        }

        const startDate = req.body.startDate ? new Date(req.body.startDate) : (req.body.createdDate ? new Date(req.body.createdDate) : new Date());
        const endDate = new Date(req.body.endDate);

        if (!req.body.endDate) {
            return res.status(400).json({
                message: "End date is required.",
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                message: "End date must be strictly after the start date.",
            });
        }

        //const savedBudget = await budgetSchema.create(req.body) //tile,description,token
        const savedBudget = await budgetSchema.create({ ...req.body, userId: req.user._id }) //tile,description,token 
        res.status(201).json({
            message: "budget saved..",
            budget: savedBudget
        })
    } catch (err) {
        res.status(500).json({
            message: "errow while saving budget ",
            err: err
        })

    }
}

const getMyBudget = async (req,res)=>{

    const userId = req.user._id
    const budget = await budgetSchema.findOne({userId})
    
    if(budget){
        res.status(200).json({
            message: "budget found..",
            data: budget
        })
    }else{
        res.status(404).json({
            message: "budget not found..",
        })
    }
    
}

const deleteMyBudget = async (req,res)=>{
    
    const budget = await budgetSchema.findByIdAndDelete(req.params.id)
    
    if(budget){
        res.status(200).json({
            message: "budget deleted..",
            data: budget
        })
    }else{
        res.status(404).json({
            message: "budget not found..",
        })
    }

}   

const updateMyBudget = async (req,res)=>{
    
    const budget = await budgetSchema.findByIdAndUpdate(req.params.id,req.body)
    
    if(budget){
        res.status(200).json({
            message: "budget updated..",
            data: budget
        })
    }else{
        res.status(404).json({
            message: "budget not found..",
        })
    }

}   

module.exports = {
    createBudget,
    getMyBudget,
    deleteMyBudget,
    updateMyBudget
}
