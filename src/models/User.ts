import {
  text,
  relationship,
  password,
  integer,
  timestamp,
  checkbox,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { BaseAccessArgs } from "@keystone-6/core/dist/declarations/src/types/config/access-control";

const isAdmin = (args: BaseAccessArgs<any>) =>
  Boolean(args.session?.data.isAdmin);

export default list({
  access: {
    operation: {
      query: isAdmin,
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
    },
  },

  // this is the fields for our User list
  fields: {
    // by adding isRequired, we enforce that every User should have a name
    //   if no name is provided, an error will be displayed
    username: text({ validation: { isRequired: true }, isIndexed: "unique" }),
    name: text({ validation: { isRequired: true } }),
    email: text(),
    discordId: text(),
    discordAvatar: text(),
    password: password(),
    // we can use this field to see what Posts this User has authored
    //   more on that in the Post list below
    posts: relationship({
      ref: "Post.author",
      many: true,
      ui: { displayMode: "count" },
    }),
    news: relationship({
      ref: "New.author",
      many: true,
      ui: {
        hideCreate: true,
        displayMode: "select",
      },
    }),
    remainingVotes: integer({ defaultValue: 0 }),
    createdAt: timestamp({
      // this sets the timestamp to Date.now() when the user is first created
      defaultValue: { kind: "now" },
    }),
    isAdmin: checkbox({
      defaultValue: false,
      ui: {
        itemView: {
          fieldPosition: "sidebar",
        },
      },
    }),
  },
  ui: {
    listView: {
      initialColumns: ["name", "email", "isAdmin"],
    },
  },
});
