const req = require("express/lib/request")
const incomeCategory = require("../models/IncomeCategoryModel")

const createIncomeCategory = async(req,res)=>{

    try{

        console.log("req.user...",req.user)
        //const savedInc = await incomeCategory.create(req.body) //tile,description,token
       const savedInc = await incomeCategory.create({...req.body,userId:req.user._id}) //tile,description,token 
        res.status(201).json({
            message:"incCat saved..",
            cat:savedInc
        })
    }catch(err){
        res.status(201).json({
            message:"error while saving incCat ",
            err:err
        })

    }



}

const getIncomecategoriesByUserId = async(req,res)=>{

    const userId = req.user._id;
    const categories = await incomeCategory.find({userId:userId})
    res.status(200).json({
        data:categories
    })

}

const deleteMyCategory = async(req,res)=>{

    const catid = req.params.id
    try{

        await incomeCategory.findByIdAndDelete(catid) //internally findOneAndDelete
        res.status(200).json({
            message:"cat deleted.."
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            message:"error while deleting category",
            err:err
        })
    }


}
module.exports = {
    createIncomeCategory,getIncomecategoriesByUserId,deleteMyCategory
}