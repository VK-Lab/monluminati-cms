import { BaseAccessArgs } from "@keystone-6/core/dist/declarations/src/types/config/access-control";

export const isAdmin = (args: BaseAccessArgs<any>) =>
  Boolean(args.session?.data.isAdmin);
