const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const expCategorySchema = new Schema({

    catName: {
        type: String
    },
    description: {
        type: String
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users"
    }

})

expCategorySchema.pre("findOneAndDelete", async function () {

    const category = await this.model.findOne(this.getFilter())

    if (category) {
        await mongoose.model("expenses").deleteMany({
            expCategory: category._id
        })
        console.log("deleted related expenses from category")
    }

})
module.exports = mongoose.model("expCategory", expCategorySchema)
