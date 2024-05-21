import { mergeSchemas } from "@graphql-tools/schema";
import { mergeTypeDefs } from "@graphql-tools/merge";
import type { GraphQLSchema } from "graphql";
import { readFileSync } from "fs";
import queryTopContributors from "./queries/queryTopContributors";
import path from "path";

const baseFolder = path.join(process.cwd(), "./src/extend-gql");
const extendSchemaTypes = [
  readFileSync(path.join(baseFolder, "extendSchema.gql")).toString("utf-8")
];

const extendGraphQLSchema = (schema: GraphQLSchema): GraphQLSchema => {
  const result = mergeSchemas({
    schemas: [schema],
    typeDefs: mergeTypeDefs([extendSchemaTypes]),
    resolvers: {
      Query: {
        topContributors: queryTopContributors,
      }
    }
  });

  return result;
};

export default extendGraphQLSchema;
