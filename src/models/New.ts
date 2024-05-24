import { image, text, relationship, checkbox } from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { document } from "@keystone-6/fields-document";
import isURL from "validator/lib/isURL";
import type { Session } from "../auth";
import { allowAll } from "@keystone-6/core/access";

const isEditor = ({ session }: { session: Session }) => {
  return Boolean(session?.data.isEditor);
};

const New = list({
  access: {
    operation: {
      query: allowAll,
      create: isEditor,
      update: isEditor,
      delete: isEditor
    }
  },
  // this is the fields for our Post list
  fields: {
    title: text({ validation: { isRequired: true } }),
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
    isPublished: checkbox({
      defaultValue: false,
      ui: {
        itemView: {
          fieldPosition: "sidebar"
        }
      }
    }),
    description: text({
      ui: {
        displayMode: "textarea"
      }
    }),
    thumbnailUrl: text(),
    sourceUrl: text({
      validation: { isRequired: true },
      hooks: {
        validateInput: async ({
          resolvedData,
          addValidationError,
          fieldKey
        }) => {
          const url = resolvedData[fieldKey];
          if (typeof url !== "string" || url.trim() === "") {
            addValidationError("URL is required");
            return;
          }

          // if (isURL(url)) {
          //   addValidationError(`Invalid URL: ${url}`);
          // }
        }
      }
    }),

    // with this field, you can set a User as the author for a Post
    author: relationship({
      // we could have used 'User', but then the relationship would only be 1-way
      ref: "User.news",

      // this is some customisations for changing how this will look in the AdminUI
      ui: {
        displayMode: "cards",
        cardFields: ["name", "email"],
        // inlineEdit: { fields: ["name", "email"] },
        linkToItem: true,
        inlineConnect: true
      },

      // a Post can only have one author
      //   this is the default, but we show it here for verbosity
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
        "thumbnail",
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
