// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import {
  image,
  text,
  relationship,
  password,
  timestamp,
  checkbox,
  integer,
} from "@keystone-6/core/fields";

// the document field is a more complicated field, so it has it's own package
import { document } from "@keystone-6/fields-document";
// if you want to make your own fields, see https://keystonejs.com/docs/guides/custom-fields

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import type { Lists } from ".keystone/types";
import { New, Hashtag } from "./models";

export const lists: Lists = {
  User: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

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
  }),

  Post: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,
    ui: {
      isHidden: false,
    },
    // this is the fields for our Post list
    fields: {
      title: text({ validation: { isRequired: true } }),

      // the document field can be used for making rich editable content
      //   you can find out more at https://keystonejs.com/docs/guides/document-fields
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),

      // with this field, you can set a User as the author for a Post
      author: relationship({
        // we could have used 'User', but then the relationship would only be 1-way
        ref: "User.posts",

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
        },

        // a Post can only have one author
        //   this is the default, but we show it here for verbosity
        many: false,
      }),

      // with this field, you can add some Tags to Posts
      tags: relationship({
        // we could have used 'Tag', but then the relationship would only be 1-way
        ref: "Tag.posts",

        // a Post can have many Tags, not just one
        many: true,

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ["name"] },
        },
      }),
    },
  }),

  // this last list is our Tag list, it only has a name field for now
  Tag: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // setting this to isHidden for the user interface prevents this list being visible in the Admin UI
    ui: {
      isHidden: false,
    },

    // this is the fields for our Tag list
    fields: {
      name: text(),
      // this can be helpful to find out all the Posts associated with a Tag
      posts: relationship({ ref: "Post.tags", many: true }),
    },
  }),

  Project: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: {
      operation: {
        query: allowAll,
        create: ({ session }) => Boolean(!!session),
        update: ({ session }) => Boolean(!!session),
        delete: ({ session }) => Boolean(!!session),
      },
    },

    // this is the fields for our Post list
    fields: {
      avatar: image({ storage: "my_s3_files" }),
      banner: image({ storage: "my_s3_files" }),
      name: text({ validation: { isRequired: true } }),

      // the document field can be used for making rich editable content
      //   you can find out more at https://keystonejs.com/docs/guides/document-fields
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
      shortDescription: text({
        ui: {
          displayMode: "textarea",
        },
      }),
      socialWeb: text(),
      socialX: text(),
      socialDiscord: text(),
      socialTelegram: text(),

      // with this field, you can add some Tags to Posts
      tags: relationship({
        // we could have used 'Tag', but then the relationship would only be 1-way
        ref: "ProjectTag.tags",

        // a Post can have many Tags, not just one
        many: true,

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ["name"] },
        },
      }),

      categories: relationship({
        ref: "Category.categories",
        many: true,
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ["name"] },
        },
      }),

      isAnnounced: checkbox({
        defaultValue: false,
        ui: {
          itemView: {
            fieldPosition: "sidebar",
          },
        },
      }),
      isNative: checkbox({
        defaultValue: false,
        ui: {
          itemView: {
            fieldPosition: "sidebar",
          },
        },
      }),
      isLeadingProject: checkbox({
        defaultValue: false,
        ui: {
          itemView: {
            fieldPosition: "sidebar",
          },
        },
      }),
      votes: integer({ defaultValue: 0 }),
    },
    ui: {
      listView: {
        initialColumns: [
          "name",
          "socialWeb",
          "socialX",
          "socialDiscord",
          "isNative",
          "isLeadingProject",
        ],
      },
    },
  }),

  // this last list is our Tag list, it only has a name field for now
  ProjectTag: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // setting this to isHidden for the user interface prevents this list being visible in the Admin UI
    ui: {
      isHidden: false,
    },

    // this is the fields for our Tag list
    fields: {
      name: text(),
      // this can be helpful to find out all the Projects associated with a Tag
      tags: relationship({ ref: "Project.tags", many: true }),
    },
  }),

  Category: list({
    access: allowAll,
    ui: {
      isHidden: false,
    },

    fields: {
      name: text(),
      categories: relationship({ ref: "Project.categories", many: true }),
    },
  }),

  New: New,
  Hashtag: Hashtag,
};
