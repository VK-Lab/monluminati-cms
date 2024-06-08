import { text, relationship } from "@keystone-6/core/fields";
import { allowAll } from "@keystone-6/core/access";
import { list } from "@keystone-6/core";
import { isAdmin } from "./utils";

const Hashtag = list({
  access: {
    operation: {
      query: allowAll,
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
    },
  },

  ui: {
    isHidden: true,
  },
  fields: {
    name: text(),
    hashtags: relationship({ ref: "New.hashtags", many: true }),
  },
});

export default Hashtag;
