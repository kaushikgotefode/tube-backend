import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        mobile: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: "default.jpg",
        },
        coverImage: {
            type: String,
            default: "default.jpg",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        watchHistory: [
            {
                type: ObjectId,
                ref: "Video",
            },
        ],
        refreshToken: {
            type: String,
            default: null,
        },
    },
    { timestamps: true },
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ id: this._id, email: this.email, fullName:this.fullName }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
    return token;
};
userSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign({id: this._id}, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    });
    this.refreshToken = refreshToken;
    this.save();
    return refreshToken;
};
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    return userObject;
};
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
    return user;
};

const User = mongoose.model("User", userSchema);
export default User;
export { userSchema };
