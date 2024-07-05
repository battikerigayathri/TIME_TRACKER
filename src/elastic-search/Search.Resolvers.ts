import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import nodemailer from "nodemailer";
import { RedisClient } from "../services/redis";
import jwt from "jsonwebtoken";

const getTransporter = () => {
  return nodemailer.createTransport({
    // Configure your email service provider here
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "prashanthberi00@gmail.com",
      pass: "atbkmetroanqoisf",
    },
  });
};
export default {
  Query: {
    hello: (root: any, { name }: { name: string }, ctx: any) =>
      `Hello ${name || "World"}`,
    createEmptyTimeSheet: async () => {
      const timesheet = await mercury.db.TimeSheet.mongoModel;
      const newTimeSheet = await timesheet.create({
        project: null,
        description: "",
        task: null,
        user: null,
        timeData: [],
      });
      console.log(newTimeSheet);
      return newTimeSheet;
    },
  },

  Mutation: {
    signUp: async (
      root: any,
      { signUpData }: { signUpData: any },
      ctx: any
    ) => {
      try {
        const userSchema = mercury.db.User;
        const existingUser = await userSchema.mongoModel.findOne({
          email: signUpData.email,
        });
        if (existingUser) throw new GraphQLError("User Already Exists");
        const newUser = await userSchema.mongoModel.create({
          userName: signUpData.userName,
          email: signUpData.email,
          password: signUpData.password,
          role: signUpData.role,
        });
        const otp = generateVerificationCode();
        await RedisClient.set(signUpData.email, otp);
        sendVerificationEmail(signUpData.email, otp + "");
        return {
          id: newUser.id,
          msg: "User Registered Successfully",
          otp: otp,
        };
      } catch (error: any) {
        throw new GraphQLError(error);
      }
    },
    signin: async (
      root: any,
      { email, password }: { email: string; password: string }
    ) => {
      try {
        const UserSchema = mercury.db.User;
        const user = await UserSchema.mongoModel.findOne({
          email,
        });
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.SECRET_TOKEN_KEY!,
          { expiresIn: "30d" }
        );
        if (!user) {
          throw new Error("Invalid  username and/or email");
        }
        const isPasswordValid = await user.verifyPassword(password);
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
        return {
          msg: "User successfully logged in",
          user: user,
          token: token,
        };
      } catch (error: any) {
        throw new GraphQLError(error);
      }
    },
    verifyOtp: async (
      root: any,
      { email, otp }: { email: string; otp: string },
      ctx: any
    ) => {
      try {
        const UserSchema = mercury.db.User.mongoModel;
        let userData = await UserSchema.findOne({ email: email });
        if (!userData) throw new Error("User not Found");
        const redisOtp = await RedisClient.get(userData.email);
        if (!redisOtp) {
          throw new Error("Otp has Expried. Please Clicked on Resend Otp");
        }
        if (redisOtp != otp) throw new Error("Invalid Otp!");
        const user = await UserSchema.findOneAndUpdate(
          { email },
          { isVerified: true }
        );
        if (!user)
          return {
            status: 400,
            msg: "User not Found",
          };
        return {
          msg: "User is Verified Successfully",
          id: user.id,
        };
      } catch (error: any) {
        throw new GraphQLError(error);
      }
    },
    ForgetPassword: async (
      root: any,
      { email }: { email: string },
      ctx: any
    ) => {
      try {
        const UserSchema = mercury.db.User.mongoModel;
        const userData = await UserSchema.findOne({ email: email });
        if (!userData) throw new Error("Invalid Email");
        const otp = generateVerificationCode();
        await RedisClient.set(email, otp);
        sendVerificationEmail(email, otp + "");
        return {
          msg: "Otp has been sent successfully to your email",
          otp: otp,
          email: email,
        };
      } catch (error: any) {
        throw new GraphQLError(error);
      }
    },
    resetPassword: async (
      root: any,
      { email, password }: { email: string; password: string }
    ) => {
      try {
        const UserSchema = mercury.db.User;
        const user = await UserSchema.get(
          {
            email,
          },
          { profile: "EMPLOYEE" }
        );
        const data = await UserSchema.update(
          user.id,
          { password },
          { profile: "EMPLOYEE" }
        );
        return {
          msg: "User password updated successfully",
          id: user.id,
        };
      } catch (error: any) {
        throw new GraphQLError(error);
      }
    },
    assignUserToProject: async (
      root: any,
      { projectId, userId }: { projectId: string; userId: string[] }
    ) => {
      console.log("hii");

      const projectSchema = mercury.db.Project;
      const data = await mercury.db.Project.get(
        { _id: projectId },
        { profile: "EMPLOYEE" }
      );
      console.log(data.id, "data");
      if (!data) {
        throw new Error("Project not found");
      }
      data.assignedTo = [];
      console.log(data.assignedTo.includes(userId), "data.asssiii");
      userId.forEach((userId) => {
        if (!data.assignedTo.includes(userId)) {
          data.assignedTo.push(userId);
        }
      });
      await data.save();
      console.log(data.assignedTo, "userID");
      return {
        msg: "Users Added Successfully",
        projectId: data.id,
      };
    },
  },
};
async function sendVerificationEmail(email: string, otp: string) {
  const transporter = getTransporter();
  const mailOptions = {
    from: "prashanthberi00@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Your Otp is ${otp}`,
  };
  const info = await transporter.sendMail(mailOptions);
}
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000); // Generate a new random 4-digit code
}
