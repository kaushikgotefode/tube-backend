import mongoose, { Schema } from "mongoose";
const { ObjectId } = Schema.Types;

const subscriptionSchema = new Schema(
    {
        subscriber: { type: ObjectId, ref: "User" },
        channel: { type: ObjectId, ref: "User" },
    },
    { timestamps: true },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
