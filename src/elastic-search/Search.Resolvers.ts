import mercury from "@mercury-js/core";
import { GraphQLError } from "graphql";
import nodemailer from "nodemailer";
import { RedisClient } from "../services/redis";
import jwt from "jsonwebtoken";
import { time } from "console";

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
        // timeData: [],
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
        console.log(otp);

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
        console.log(otp);

        const UserSchema = mercury.db.User.mongoModel;
        let userData = await UserSchema.findOne({ email: email });
        if (!userData) throw new Error("User not Found");
        const redisOtp = await RedisClient.get(userData.email);
        console.log(redisOtp, "redisotp");

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
    updatedata: async (
      root: any,
      {
        timesheetId,
        timedata,
      }: {
        timesheetId: string;
        timedata: { startTime: string; endTime: string };
      }
    ) => {
      try {
        console.log(timesheetId, timedata, "timesheet and data");

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        console.log(today);

        const existingTimeSheet = await mercury.db.TimeSheet.get(
          { _id: timesheetId },
          { profile: "EMPLOYEE" },
          {}
        );

        console.log(existingTimeSheet, "TimeSheet");

        const timeData = mercury.db.TimeData.mongoModel;

        const newTimeData = await timeData.create({
          startTime: timedata.startTime,
          endTime: timedata.endTime,
        });
        console.log(newTimeData, newTimeData.id, newTimeData._id, "wertyut");

        if (existingTimeSheet) {
          const createdOnDate = new Date(existingTimeSheet.createdOn);
          const createdOnDay = new Date(createdOnDate)
            .toISOString()
            .split("T")[0];
          let returnMessage;
          let returnId;

          if (createdOnDay === today) {
            existingTimeSheet.timeData = [
              ...existingTimeSheet.timeData,
              newTimeData._id,
            ];
            await existingTimeSheet.save();
            console.log("TimeSheet updated with new TimeData");
            returnMessage = "TimeSheet updated with new TimeData";
            returnId = existingTimeSheet;
          } else {
            const TimeSheetModel = mercury.db.TimeSheet.mongoModel;
            const newTimeSheet = await TimeSheetModel.create({
              project: existingTimeSheet.project,
              task: existingTimeSheet.task,
              description: existingTimeSheet.description,
              user: existingTimeSheet.user,
              timeData: [newTimeData._id],
              createdOn: now,
            });
            console.log(newTimeSheet, "New TimeSheet created");
            returnMessage = "New TimeSheet created";
            returnId = newTimeSheet;
          }
          return {
            msg: returnMessage,
            id: returnId,
          };
        }
      } catch (error) {
        console.error("Error updating or creating TimeSheet:", error);
        throw new Error("Failed to update or create TimeSheet");
      }
    },
    timeSheetcreation: async (
      root: any,
      {
        project,
        task,
        user,
        timedata,
        description,
      }: {
        project: string;
        task: string;
        user: string;
        timedata: { startTime: string; endTime: string };
        description: string;
      }
    ) => {
      try {
        console.log(project, task, user, timedata, "input data");

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        console.log(today);
        const timesheetModel = mercury.db.TimeSheet.mongoModel;

        const existingTimeSheetArray = await timesheetModel
          .find(
            {
              project: project,
              task: task,
              user: user,
            },
            {}
          )
          .sort({ updatedOn: -1 })
          .limit(1);

        const existingTimeSheet = existingTimeSheetArray[0];
        console.log(existingTimeSheet, "existingTimeSheet");
        const timeDataModel = mercury.db.TimeData.mongoModel;
        const newTimeData = await timeDataModel.create({
          startTime: timedata.startTime,
          endTime: timedata.endTime,
        });
        console.log(newTimeData, "newTimeData created");
        let returnId;
        let returnMessage;
        if (existingTimeSheet) {
          const createdOnDate = new Date(existingTimeSheet.createdOn);
          const createdOnDay = createdOnDate.toISOString().split("T")[0];
          console.log(createdOnDay === today, "date check");
          console.log(createdOnDay, today);
          if (createdOnDay === today) {
            existingTimeSheet.timeData = [
              ...existingTimeSheet.timeData,
              newTimeData._id,
            ];
            await existingTimeSheet.save();
            returnId = existingTimeSheet._id;
            returnMessage = "TimeSheet updated";
            console.log(returnId, returnMessage, "updated timesheet");
          } else {
            const newTimeSheet = await timesheetModel.create({
              project: existingTimeSheet.project,
              task: existingTimeSheet.task,
              description: existingTimeSheet.description,
              user: existingTimeSheet.user,
              timeData: [newTimeData._id],
              createdOn: now,
            });
            console.log(newTimeSheet, "New TimeSheet created forrr");
            returnMessage = "New TimeSheet created forrr";
            returnId = newTimeSheet._id;
          }
        } else {
          const newTimeSheet = await timesheetModel.create({
            project: project,
            task: task,
            description: description,
            user: user,
            timeData: [newTimeData._id],
            createdOn: now,
          });
          console.log(newTimeSheet, "New TimeSheet created");
          returnMessage = "New TimeSheet created";
          returnId = newTimeSheet._id;
        }

        console.log(returnId, returnMessage, "final result");
        return {
          msg: returnMessage,
          id: returnId,
        };
      } catch (error) {
        console.error("Error creating or updating timesheet:", error);
        throw new Error("Failed to create or update timesheet");
      }
    },

    timerTimesheet: async (
      root: any,
      {
        timesheetId,
        timedata,
        project,
        task,
        user,
      }: {
        timesheetId: string;
        timedata: {
          _id: any;
          startTime: string;
          endTime: string;
        };
        project: string;
        task: string;
        user: string;
      }
    ) => {
      console.log(timesheetId, timedata);
      let returnMessage = "No action taken";
      let returnId = null;
      try {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        console.log("Today's Date: ${today}");
        const timesheetModel = mercury.db.TimeSheet.mongoModel;
        let existingTimeSheet;

        if (timesheetId) {
          existingTimeSheet = await mercury.db.TimeSheet.get(
            { _id: timesheetId },
            { profile: "EMPLOYEE" }
          );
          console.log("Existing TimeSheet by ID:", existingTimeSheet);
        }

        if (!existingTimeSheet) {
          const existingTimeSheetArray = await timesheetModel
            .find(
              {
                project: project,
                task: task,
                user: user,
              },
              {}
            )
            .sort({ updatedOn: -1 })
            .limit(1);

          existingTimeSheet = existingTimeSheetArray[0];
          console.log("Most recent TimeSheet:", existingTimeSheet);
        }

        if (existingTimeSheet) {
          const createdOnDate = new Date(existingTimeSheet.createdOn);
          const createdOnDay = createdOnDate.toISOString().split("T")[0];
          console.log(`Created On: ${createdOnDay}`);

          if (createdOnDay === today) {
            if (
              existingTimeSheet.timeData &&
              existingTimeSheet.timeData.length > 0
            ) {
              const existingTimeDataId =
                existingTimeSheet.timeData[
                  existingTimeSheet.timeData.length - 1
                ];
              const timeData = mercury.db.TimeData.mongoModel;
              const existingTimeData = await timeData.findById(
                existingTimeDataId
              );

              if (existingTimeData) {
                existingTimeData.startTime = timedata.startTime;
                existingTimeData.endTime = timedata.endTime || null;
                await existingTimeData.save();
                console.log("Existing TimeData updated:", existingTimeData);
                returnMessage = "Existing TimeData updated";
                returnId = existingTimeSheet._id;
              } else {
                console.log(
                  "No existing TimeData found to update, creating new TimeData."
                );
                const newTimeData = await timeData.create({
                  startTime: timedata.startTime,
                  endTime: timedata.endTime || null,
                });
                existingTimeSheet.timeData.push(newTimeData._id);
                await existingTimeSheet.save();
                console.log(
                  "New TimeData created and added to TimeSheet:",
                  newTimeData
                );
                returnMessage =
                  "New TimeData created and added to existing TimeSheet";
                returnId = existingTimeSheet._id;
              }
            } else {
              console.log(
                "No existing TimeData found in TimeSheet, creating new TimeData."
              );
              const timeData = mercury.db.TimeData.mongoModel;
              const newTimeData = await timeData.create({
                startTime: timedata.startTime,
                endTime: timedata.endTime || null,
              });
              existingTimeSheet.timeData.push(newTimeData._id);
              await existingTimeSheet.save();
              console.log(
                "New TimeData created and added to TimeSheet:",
                newTimeData
              );
              returnMessage =
                "New TimeData created and added to existing TimeSheet";
              returnId = existingTimeSheet._id;
            }
            existingTimeSheet.project = project;
            existingTimeSheet.task = task;
            existingTimeSheet.user = user;
            await existingTimeSheet.save();
            console.log(
              "TimeSheet updated with new TimeData and project, task, user fields."
            );
            returnMessage = "TimeSheet updated with new TimeData";
            returnId = existingTimeSheet._id;

            // No update to project, task, or user
          }
        }
      } catch (error: any) {
        console.error("Error updating or creating TimeSheet:", error);
        throw new Error("Failed to update or create TimeSheet");
      }
      return {
        msg: returnMessage,
        id: returnId,
      };
    },
  },
};
// timesheet id pamputhe
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
