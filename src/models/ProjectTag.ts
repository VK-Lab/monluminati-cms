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
});
