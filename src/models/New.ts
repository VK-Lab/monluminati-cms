import { image, text, relationship, checkbox } from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { document } from "@keystone-6/fields-document";
// import isURL from "validator/lib/isURL";
import type { Session } from "../auth";
import { allowAll } from "@keystone-6/core/access";

const isAdmin = ({ session }: { session: Session }) => {
  return Boolean(session?.data.isAdmin);
};

const New = list({
  access: {
    operation: {
      query: allowAll,
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin
    }
  },
  // this is the fields for our Post list
  fields: {
    title: text({ validation: { isRequired: true } }),
    isPublished: checkbox({
      defaultValue: false,
      ui: {
        itemView: {
          fieldPosition: "sidebar"
        }
      }
    }),
    thumbnail: image({ storage: "my_s3_files" }),
    content: document({
      formatting: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
        [2, 1],
        [1, 2],
        [1, 2, 1]
      ],
      links: true,
      dividers: true
    }),
    description: text({
      ui: {
        displayMode: "textarea"
      }
    }),
    thumbnailUrl: text(),
    sourceUrl: text({
      validation: { isRequired: true },
    }),

    author: relationship({
      ref: "User.news",
      ui: {
        displayMode: "cards",
        cardFields: ["name", "email"],
        linkToItem: true,
        inlineConnect: true
      },
      many: false
    }),

    hashtags: relationship({
      ref: "Hashtag.hashtags",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["name"],
        inlineEdit: { fields: ["name"] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ["name"] }
      }
    })
  },
  ui: {
    isHidden: false,
    listView: {
      initialColumns: [
        "title",
        "author",
        "isPublished",
        "sourceUrl",
        "hashtags"
      ]
    }
  }
});

export default New;
