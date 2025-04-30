import mongoose from "mongoose";
import mongooseAgregatePaginate from "mongoose-aggregate-paginate-v2";
const { ObjectId } = mongoose.Schema.Types;



const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },duration: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            userId: {
                type: ObjectId,
                ref: 'User',
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
            likes: {
                type: Number,
                default: 0,
            },
            dislikes: {
                type: Number,
                default: 0,
            },
        },
    ],
    isPublished: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
videoSchema.plugin(mongooseAgregatePaginate);
const Video = mongoose.model('Video', videoSchema);
export default Video;
export { videoSchema };