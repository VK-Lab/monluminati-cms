import { mergeSchemas } from "@graphql-tools/schema";
import { mergeTypeDefs } from "@graphql-tools/merge";
import type { GraphQLSchema } from "graphql";
import { readFileSync } from "fs";
import path from "path";

const baseFolder = path.join(process.cwd(), "./src/extend-gql");
const extendSchemaTypes = [
  readFileSync(path.join(baseFolder, "extendSchema.gql")).toString("utf-8"),
];

const extendGraphQLSchema = (schema: GraphQLSchema): GraphQLSchema => {
  const result = mergeSchemas({
    schemas: [schema],
    typeDefs: mergeTypeDefs([
      extendSchemaTypes,
    ]),
    resolvers: {
      Query: {
        topContributors: async () => {
          try {
            const response = await fetch("https://mee6.xyz/api/plugins/levels/leaderboard/1036357772826120242?page=1");
            const result = await response.json();
            return result?.players ?? [];
          } catch (error: any) {
            return [];
          }
        }
      }
    },
  });

  return result;
};

export default extendGraphQLSchema;
