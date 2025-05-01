import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { uploadFileToCloudinary } from "../utils/Cloudinary.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
};

const generateAccessAndRefreshTokens = async userId => {
    const user = await User.findById(userId);
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, mobile, password, username, address } = req.body;

    if ([fullName, email, mobile, password, username].some(value => value?.trim() === "")) {
        throw new ApiError(400, "All feilds are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exist");
    }

    const avatarLocalPath = req.files?.avatar && req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage && req.files?.coverImage[0]?.path;

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
        username,
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

    return res.status(201).json(new ApiResponce(201, createdUser, "User created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email required.");
    }

    const user = await User.findByCredentials(username, email, password);

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = user.toJSON();

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponce(
                200,
                {
                    user: loggedInUser,
                    token: accessToken,
                    refreshToken: refreshToken,
                },
                "User LoggedIn successfully",
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        { new: true },
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponce(200, {}, "User logged out successfully"));
});

const refreshActionToken = asyncHandler(async (req, res) => {
    const incommingRefreshtoken = req.cookies["refreshToken"] || req.body.refreshToken;
    if (!incommingRefreshtoken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(incommingRefreshtoken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw ApiError(401, "Unauthorized request");
        }
        if (incommingRefreshtoken !== user.refreshToken) {
            throw ApiError(401, "Refresh token expired");
        }

        const { accessToken, newRefreshToken } = generateAccessAndRefreshTokens(user._id);

        res.cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(new ApiResponce(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    } catch (error) {
        throw ApiError(401, error.message || "Invalid refresh token");
    }
});

export { registerUser, loginUser, logoutUser, refreshActionToken };
