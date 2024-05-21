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
import type { Context } from ".keystone/types";
import { schedule } from "node-cron";
import { Strategy } from "passport-discord";
import * as passport from "passport";
import { seal, defaults } from "@hapi/iron";

dotenv.config();

const {
  S3_BUCKET_NAME: bucketName = "keystone-test",
  S3_REGION: region = "ap-southeast-1",
  S3_ACCESS_KEY_ID: accessKeyId = "keystone",
  S3_SECRET_ACCESS_KEY: secretAccessKey = "keystone",
  CLIENT_BASE_URL: clientOrigin = "http://localhost:3000",
  MODE,
} = process.env;

const IS_DEV = MODE === "development" || process.env.NODE_ENV === "development";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3555;

export default withAuth(
  config({
    db: {
      provider: "sqlite",
      url: "file:./keystone.db",
      onConnect: async (context: Context) => {
        // Run every week on Sunday 00:00
        schedule("0 0 * * 0", async () => {
          console.log("Start cron jobs to add available votes to users");
          const response = await fetch(
            "https://mee6.xyz/api/plugins/levels/leaderboard/1036357772826120242?limit=50&page=0",
          );
          const result = await response.json();
          const topUsers = result.players;

          const existingUsers = await context.db.User.findMany();
          for (const existingUser of existingUsers) {
            const isTop = topUsers.find(
              (user: { id: string }) => user.id === existingUser.discordId,
            );
            if (!isTop) {
              await context.db.User.updateOne({
                where: {
                  id: existingUser.id,
                },
                data: {
                  remainingVotes: existingUser.remainingVotes! + 1,
                },
              });
            }
          }

          for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const addVotes = 50 - i;
            const existingUser = existingUsers.find(
              (u) => u.discordId === user.id,
            );
            if (existingUser) {
              await context.db.User.updateOne({
                where: {
                  id: existingUser.id,
                },
                data: {
                  remainingVotes: existingUser.remainingVotes! + addVotes,
                },
              });
            } else {
              await context.db.User.createOne({
                data: {
                  discordId: user.id,
                  username: user.username,
                  name: user.username,
                  remainingVotes: addVotes,
                },
              });
            }
          }
        });
      },
    },
    lists,
    session,
    server: {
      extendExpressApp: (app, context) => {
        passport.use(
          new Strategy(
            {
              clientID: process.env.DISCORD_APP_ID!,
              clientSecret: process.env.DISCORD_SECRET!,
              callbackURL: process.env.DISCORD_REDIRECT_URL!,
              scope: ["identify", "email"],
            },
            async (_accessToken, _refreshToken, profile, done) => {
              let user = await context.db.User.findOne({
                where: { discordId: profile.id },
              });
              if (!user) {
                user = await context.db.User.createOne({
                  data: {
                    discordId: profile.id,
                    username: profile.username,
                    name: profile.username,
                  },
                });
              }
              return done(null, { id: user.id });
            },
          ),
        );

        app.get("/api/auth/discord", passport.authenticate("discord"));
        app.get(
          "/api/auth/discord/redirect",
          passport.authenticate("discord", {
            session: false,
          }),
          async (req, res) => {
            const user = req.user! as { id: string };
            const sessionToken = await seal(
              { listKey: "User", itemId: user.id },
              process.env.SESSION_SECRET!,
              defaults,
            );
            res.json({ sessionToken });
          },
        );
      },
      port: PORT,
      cors: IS_DEV
        ? {
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204,
          }
        : {
            origin: [clientOrigin],
          },
    },
    graphql: {
      extendGraphqlSchema: extendGraphQLSchema,
      path: "/api/graphql",
      apolloConfig: {
        csrfPrevention: !IS_DEV,
      },
      playground: PLAYGROUND_GQL,
      schemaPath: "../schema.graphql",
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
        signed: { expiry: 3600 }, // (optional) links will be signed with an expiry of 3600 seconds (an hour)
      },
      /** more storage */
    },
  }),
);
