import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { uploadFileToCloudinary } from "../utils/Cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, mobile, password, username } = req.body;

    if ([fullName, email, mobile, password, username].some(value => value?.trim() === "")) {
        throw new ApiError(400, "All feilds are required");
    }

    const existingUser = User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exist");
    }

    const avatarLocalPath = req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadFileToCloudinary(avatarLocalPath);
    const coverImage = await uploadFileToCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        address,
        coverImage: coverImage?.url || "",
        mobile,
        email,
        password,
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering new User");
    }

    return res.status(200).json(new ApiResponce(200, createdUser, "User created Successfully"));
});

export { registerUser };
