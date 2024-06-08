// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import type { Lists } from ".keystone/types";
import {New, Hashtag, Category, Project, ProjectTag, Post} from "./models";
import Tag from "./models/Tag";
import User from "./models/User";

export const lists: Lists = {
  User,
  Post,
  Tag,
  Project,
  ProjectTag,
  Category,
  New,
  Hashtag,
};
