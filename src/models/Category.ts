import { text, relationship } from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import {BaseAccessArgs} from "@keystone-6/core/dist/declarations/src/types/config/access-control";

const isAdmin = (args: BaseAccessArgs<any>) => Boolean(args.session?.data.isAdmin)

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
