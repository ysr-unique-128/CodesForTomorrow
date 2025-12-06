import mongoose from "mongoose";

const PlanSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        monthlyQuota: {
            type: Number,
            required: true
        },
        extraChargePerUnit: {
            type: mongoose.Schema.Types.Decimal128,
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Plan = mongoose.model("Plan", PlanSchema);

export default Plan;