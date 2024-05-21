import { text, relationship } from "@keystone-6/core/fields";
import { allowAll } from "@keystone-6/core/access";
import { list } from "@keystone-6/core";

const Hashtag = list({
  access: allowAll,

  // setting this to isHidden for the user interface prevents this list being visible in the Admin UI
  ui: {
    isHidden: true
  },

  // this is the fields for our Tag list
  fields: {
    name: text(),
    hashtags: relationship({ ref: "New.hashtags", many: true })
  }
});

export default Hashtag;
