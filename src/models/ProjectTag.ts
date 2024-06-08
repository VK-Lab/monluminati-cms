import { text, relationship } from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import {BaseAccessArgs} from "@keystone-6/core/dist/declarations/src/types/config/access-control";

const isAdmin = (args: BaseAccessArgs<any>) => Boolean(args.session?.data.isAdmin)

export default list({
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
  });
