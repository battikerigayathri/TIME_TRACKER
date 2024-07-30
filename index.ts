import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { makeExecutableSchema } from "graphql-tools";
import { applyMiddleware } from "graphql-middleware";
import mercury from "@mercury-js/core";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import * as dotenv from "dotenv";
import multer from "multer";
import AWS from "aws-sdk";
dotenv.config();
import "./src/models"
import "./src/hooks"
import "./src/profiles"
import {typeDefs} from "./src/elastic-search/schema"
import resolvers from "elastic-search/resolvers";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const upload = multer({ storage: multer.memoryStorage() });

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY || "AKIAUGJSFTLHXBO2645E",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  region: process.env.AWS_REGION_KEY,
});
const s3 = new AWS.S3();
app.post("/profile", upload.single("file"), async (req: any, res: any) => {
  try {
    const { userId, name } = req.body;
    const userSchema = mercury.db.User.mongoModel;
    const user = await userSchema.findById(userId).populate("profile");
    if (!user) {
      throw new Error("User not found");
    }
    const existingProfile = user.profile;
    if (existingProfile) {
      console.log("Existing Profile ID:", existingProfile._id.toString());
    }

    if (!req.file) {
      throw new Error("File not found");
    }
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype.split("/")[1];
    const fileKey = `profile/${uuidv4()}_${
      name.toString().split(" ")[0]
    }.${fileType}`;
    console.log("File Key:", fileKey);
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ACL: "public-read",
      ContentType: req.file.mimetype,
    };

    const s3Data = await s3.upload(params).promise();

    const profileData = {
      name: name,
      type: fileType,
      path: `https://s3.ap-south-1.amazonaws.com/vithiblog.in/${fileKey}`,
    };

    let profile;
    if (existingProfile) {
      // Update existing profile
      existingProfile.set(profileData);
      profile = await existingProfile.save();
    } else {
      // Create new profile
      profile = await mercury.db.Profile.create(profileData, {
        profile: "EMPLOYEE",
      });
      user.profile = profile._id;
      await user.save();
    }

    console.log("Profile:", profile);
    res.status(200).json({ success: true, user, profile });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(400).json({ error: error.message });
  }
});
mercury.addGraphqlSchema(typeDefs, resolvers);
const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: mercury.typeDefs,
    resolvers: mercury.resolvers,
    // schemaDirectives,
  })
);
console.log("DB_URL", process.env.DB_URL);
(async function startApolloServer() {
  // connect db to mercury
  mercury.connect(process.env.DB_URL || "");

  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    introspection: true,
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    rootValue: () => {
      return {
        mercuryResolvers: mercury.resolvers,
      };
    },
  });
  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOptions),
    bodyParser.json(),
    //limiter,
    expressMiddleware(server, {
      context: async ({ req }) => {
        return { ...req, user: { profile: "EMPLOYEE" } };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4001 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4001/graphql`);
})();
