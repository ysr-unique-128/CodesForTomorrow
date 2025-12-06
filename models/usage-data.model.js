import mongoose from "mongoose";

const UsageDataSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        action: {
            type: String,
            required: true
        },
        usedUnits: {
            type: Number,
            required: true
        },
        createdAt: {
            type: String,
            default: Date.now
        },
    },
    {
        timestamps: true
    }
);

const UsageData = mongoose.model("UsageData", UsageDataSchema);

export default UsageData;