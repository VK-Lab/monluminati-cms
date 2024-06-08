import {text, relationship, image, checkbox, integer} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import {BaseAccessArgs} from "@keystone-6/core/dist/declarations/src/types/config/access-control";
import {document} from "@keystone-6/fields-document";

const isAdmin = (args: BaseAccessArgs<any>) => Boolean(args.session?.data.isAdmin)

export default list({
  // WARNING
  //   for this starter project, anyone can create, query, update and delete anything
  //   if you want to prevent random people on the internet from accessing your data,
  //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
  access: {
    operation: {
      query: allowAll,
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
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
});
