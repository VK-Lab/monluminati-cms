// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from "@keystone-6/core";
import * as dotenv from "dotenv";
// to keep this file tidy, we define our schema in a different file
import { lists } from "./schema";
import { PLAYGROUND_GQL } from "./constants";
// authentication is configured separately here too, but you might move this elsewhere
// when you write your list-level access control functions, as they typically rely on session data
import { withAuth, session } from "./auth";
import extendGraphQLSchema from "./extendSchema";

dotenv.config();

const {
  S3_BUCKET_NAME: bucketName = "keystone-test",
  S3_REGION: region = "ap-southeast-1",
  S3_ACCESS_KEY_ID: accessKeyId = "keystone",
  S3_SECRET_ACCESS_KEY: secretAccessKey = "keystone",
  CLIENT_BASE_URL: clientOrigin = "http://localhost:3000",
  MODE
} = process.env;

const IS_DEV = MODE === "development" || process.env.NODE_ENV === "development";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3555;

export default withAuth(
  config({
    db: {
      provider: "sqlite",
      url: "file:./keystone.db"
    },
    lists,
    session,
    server: {
      port: PORT,
      cors: IS_DEV
        ? {
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204
          }
        : {
            origin: [clientOrigin]
          }
    },
    graphql: {
      extendGraphqlSchema: extendGraphQLSchema,
      path: "/api/graphql",
      apolloConfig: {
        csrfPrevention: IS_DEV ? false : true
      }, 
      playground: PLAYGROUND_GQL,
      schemaPath: "../schema.graphql"
    }, 
      
    /** config */
    storage: {
      my_s3_files: {
        kind: "s3", // this storage uses S3
        type: "image", // only for files
        bucketName, // from your S3_BUCKET_NAME environment variable
        region, // from your S3_REGION environment variable
        accessKeyId, // from your S3_ACCESS_KEY_ID environment variable
        secretAccessKey, // from your S3_SECRET_ACCESS_KEY environment variable
        signed: { expiry: 3600 } // (optional) links will be signed with an expiry of 3600 seconds (an hour)
      }
      /** more storage */
    }
  })
);
