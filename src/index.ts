import express from "express";
import RateLimiterMemory, {
  Options,
  RateLimitRequestHandler,
} from "express-rate-limit";
import http from "http";
import fs from "fs";
//import  historyTracking  from '@mercury-js/core/packages/historyTracking
import cors from "cors";
import bodyParser from "body-parser";
import { makeExecutableSchema } from "graphql-tools";
import { applyMiddleware } from "graphql-middleware";
import mercury from "@mercury-js/core";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import * as dotenv from "dotenv";
//import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
dotenv.config();
// Connect models to the process. Mercury will generate the API/Query and Mutations
// import "./models";
// import "./profiles";
// import "./hooks";
import { typeDefs } from "./elastic-search/schema"
import resolvers from "./elastic-search/Search.Resolvers";

// import { typeDefs, resolvers, schemaDirectives } from "./elastic-search";
// import { setContext } from "./helpers/setContext";
// import { upload } from "./helpers/s3Uploader";
// import { Record } from "./record";
// import { Base } from "./connect";


const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));




mercury.addGraphqlSchema(typeDefs, resolvers);
const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: mercury.typeDefs,
    resolvers: mercury.resolvers,
    // schemaDirectives,
  })
);

// const limiter: RateLimitRequestHandler = RateLimiterMemory({
//   windowMs: 15 * 60 * 1000,
//   limit: 1,
//   message: 'Too many requests, please try again later.',
// });
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
   const setContext = async (req:any) => {
     return {
       role: "ADMIN", // Directly setting the role to 'admin'
     };
   };
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOptions),
    bodyParser.json(),
    //limiter,
    expressMiddleware(server, {
      context: async ({ req }) => await setContext(req),
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4001 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4001/graphql`);
})();

//while uploading documents for first time====recordtype:Verify,requestId:userid,document_type:documentname[pan card,adhar card],documents:uploading files in this fields
//while reuploading documents ====recordtype:Verify,requestId:verifyid,document_type:documentname[pan card,adhar card],
