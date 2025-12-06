import mongoose from "mongoose";

const SubscriptionSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        planId: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;