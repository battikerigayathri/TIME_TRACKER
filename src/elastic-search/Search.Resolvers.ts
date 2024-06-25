import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import nodemailer from "nodemailer";
import { RedisClient } from "../services/redis";

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
          email: signUpData.email
        })
        if (existingUser) throw new GraphQLError("User Already Exists");
        const newUser = await userSchema.mongoModel.create({
          ...signUpData
        })
        const otp = generateVerificationCode();
        await RedisClient.set(signUpData.email, otp);
        sendVerificationEmail(signUpData.email, otp + "");
        return {
          id: newUser.id,
          msg: "User Registered Successfully",
          otp:otp
        }

      } catch (error:any) {
        throw new GraphQLError(error)
      }
      
    },
    signin: async (root: any, { email, password }: { email: string, password: string }) => {
     try {
      const UserSchema = mercury.db.User;
 
      const user = await UserSchema.mongoModel.findOne({
        email,
      });
      //  console.log(user,"loginuser");
 
      if (!user) {
        throw new Error("Invalid  username and/or email");
      }
 
      const isPasswordValid = await user.verifyPassword(password);
      //  console.log(isPasswordValid.password, "isvalidpassword");
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }
        return {
          msg: "User successfully logged in",
          
        };
     } catch (error) {
      
     }
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

  // console.log("trasnporter", transporter)
  const info = await transporter.sendMail(mailOptions);
  //   console.log("info", info);
}
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000); // Generate a new random 4-digit code
}