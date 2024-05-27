import { text, relationship } from "@keystone-6/core/fields";
import { allowAll } from "@keystone-6/core/access";
import { list } from "@keystone-6/core";

const Hashtag = list({
  access: allowAll,
  ui: {
    isHidden: true
  },
  fields: {
    name: text(),
    hashtags: relationship({ ref: "New.hashtags", many: true })
  }
});

export default Hashtag;
