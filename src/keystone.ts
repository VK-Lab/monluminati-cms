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

          const existingUsers = await context.db.User.findMany({
            where: { isAdmin: { equals: false } },
          });
          let usersToCreate = [];
          let usersToUpdate = existingUsers
            .filter(
              (existingUser) =>
                !topUsers.find(
                  (topUser: { id: string }) =>
                    topUser.id === existingUser.discordId,
                ),
            )
            .map((existingUser: { id: any; remainingVotes: any }) => ({
              where: {
                id: existingUser.id,
              },
              data: {
                remainingVotes: existingUser.remainingVotes! + 1,
              },
            }));

          for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const addVotes = 50 - i;
            const existingUser = existingUsers.find(
              (u) => u.discordId === user.id,
            );
            if (existingUser) {
              usersToUpdate.push({
                where: {
                  id: existingUser.id,
                },
                data: {
                  remainingVotes: existingUser.remainingVotes! + addVotes,
                },
              });
            } else {
              usersToCreate.push({
                discordId: user.id,
                username: user.username,
                name: user.username,
                remainingVotes: addVotes,
              });
            }
          }

          await context.db.User.createMany({ data: usersToCreate });
          await context.db.User.updateMany({ data: usersToUpdate });
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
              let user = (
                await context.db.User.findMany({
                  where: { discordId: { equals: profile.id } },
                })
              )[0];
              let discordAvatar;
              if (profile.avatar) {
                const format = profile.avatar.startsWith("a_") ? "gif" : "png";
                discordAvatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
              }
              if (!user) {
                // Get initial votes
                const response = await fetch(
                  "https://mee6.xyz/api/plugins/levels/leaderboard/1036357772826120242?limit=50&page=0",
                );
                const result = await response.json();
                const topUsers = result.players;
                const top = topUsers.findIndex(
                  (topUser: { id: string }) => topUser.id === profile.id,
                );
                let remainingVotes = 1;
                if (top > -1) {
                  remainingVotes = 50 - top;
                }
                user = await context.prisma.user.create({
                  data: {
                    discordId: profile.id,
                    username: profile.username,
                    name: profile.global_name,
                    discordAvatar,
                    remainingVotes,
                  },
                });
              } else {
                user = await context.prisma.user.update({
                  where: { id: user.id },
                  data: { name: profile.global_name, discordAvatar },
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
            res.cookie("keystonejs-session", sessionToken);
            res.redirect(clientOrigin);
          },
        );
        app.post("/api/auth/logout", async (req, res) => {
          await context.sessionStrategy?.end({ context });

          res.clearCookie("keystonejs-session");
          res.json({ status: "ok" });
        });
      },
      port: PORT,
      cors: {
        origin: [clientOrigin],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 200,
        credentials: true,
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
