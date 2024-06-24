import _ from "lodash";
// @ts-ignore
import { createRateLimitDirective, RedisStore } from "graphql-rate-limit";
// @ts-ignore
import { mergeTypes, mergeResolvers, fileLoader } from "merge-graphql-schemas";
import { importSchema } from "graphql-import";
import CombinedResolvers from "./resolvers";

// Merge all the types from *.graphql from all the files of child folder.
export const typeDefs = importSchema("./**/*.graphql");

// Merge all the resolvers from *.resolvers from all the files of resolvers file.
export const resolvers = mergeResolvers(CombinedResolvers);

// Declare all the schemaDirective
export const schemaDirectives = {
  rateLimit: createRateLimitDirective({
    identifyContext: (ctx: { req: { ip: String } }) => ctx.req.ip,
    // store: new RedisStore(),
  }),
};
