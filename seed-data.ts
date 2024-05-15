import { getContext } from "@keystone-6/core/context";
import * as PrismaModule from "@prisma/client";
import projects from "./seed-projects";
import config from "./keystone";

async function main() {
  const context = getContext(config, PrismaModule);

  console.log(`🌱 Inserting seed data`);

  for (const project of projects) {
    const { category, tags, name, native, announced, social } =   project;

    /**
     * Insert Category
     */
    const categoryRecord = await context.db.Category.findMany({
      where: {
        name: {
          equals: category
        },
      }
    });

    let idCategory = categoryRecord?.[0]?.id;
    if (!categoryRecord?.length) {
      console.log(`🌱 Inserting Category:: ${category}`);
      const result = await context.db.Category.createOne({
        data: {
          name: category
        }
      });
      idCategory = result.id;
    }

    /**
     * Insert Project tag
     */
    const projectTagRecord = await context.db.ProjectTag.findMany({
      where: {
        name: {
          equals: tags
        },
      }
    });

    let idProjectTag = projectTagRecord?.[0]?.id;
    if (!projectTagRecord?.length) {
      console.log(`🌱 Inserting ProjectTag:: ${tags}`);
      const result = await context.db.ProjectTag.createOne({
        data: {
          name: tags
        }
      });
      idProjectTag = result.id;
    }

    const projectRecord = await context.db.Project.findMany({
      where: {
        name: {
          equals: name
        },
      }
    });
    

    /**
     * Insert Project
     */
    if (!projectRecord?.length) {
      console.log(`🌱 Inserting Project:: ${name}`);
      await context.db.Project.createOne({
        data: {
          name,
          socialWeb: social.website ?? "",
          socialX: social.x ?? "",
          socialDiscord: social.discord ?? "",
          tags: { connect: [{ id: idProjectTag }] }, // Use connect for relationships
          categories: { connect: [{ id: idCategory }] },
          isAnnounced: announced === "TRUE",
          isNative: native === "TRUE",
          isLeadingProject: false
        }
      });
    }
  }

  console.log(`✅ Seed data inserted`);
  console.log(
    `👋 Please start the process with \`yarn dev\` or \`npm run dev\``
  );
}

main();
