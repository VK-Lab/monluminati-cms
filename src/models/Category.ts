import { text, relationship } from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { isAdmin } from "./utils";

export default list({
  access: {
    operation: {
      query: allowAll,
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
    },
  },
  ui: {
    isHidden: false,
  },

  fields: {
    name: text(),
    categories: relationship({ ref: "Project.categories", many: true }),
  },
});
