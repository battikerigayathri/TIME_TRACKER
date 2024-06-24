import express from "express";
import http from "http";
import cors from 'cors';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from "graphql-tools";
import { applyMiddleware } from "graphql-middleware";
import mercury from "@mercury-js/core";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
// Connect models to the process. Mercury will generate the API/Query and Mutations
import "./models";

import { typeDefs, resolvers, schemaDirectives } from "./elastic-search";

const app = express();

app.get("/hello", (req, res) => {
  const t = req;
  res.status(200).send("Hello World!!!");
});

const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: mergeTypeDefs([typeDefs, mercury.schema]),
    resolvers: mergeResolvers([resolvers, mercury.resolvers]),
    schemaDirectives,
  })
);

(async function startApolloServer() {
  // connect db to mercury
  mercury.connect(process.env.DB_URL || "mongodb://localhost:27017/test");

  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  app.use('/graphql',cors<cors.CorsRequest>(),
  bodyParser.json(), expressMiddleware(server));
  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/`);
})();
