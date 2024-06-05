import type { Context } from ".keystone/types";

export default async (_root: any, args: {}, context: Context) => {
  return await context.db.User.findOne({
    where: { id: context.session?.itemId },
  });
};
