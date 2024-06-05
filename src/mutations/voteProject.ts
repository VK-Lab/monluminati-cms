import type { Context } from ".keystone/types";

export default async (_root: any, args: { id: string }, context: Context) => {
  const user = await context.db.User.findOne({
    where: { id: context.session.itemId },
  });
  const project = await context.db.Project.findOne({ where: { id: args.id } });
  if (!project) {
    throw new Error("No project found");
  }
  if (!user?.remainingVotes) {
    throw new Error("No remaining vote");
  }
  const prisma = context.prisma;
  const newVotes = (project.votes ?? 0) + 1;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: context.session.itemId },
      data: { remainingVotes: user.remainingVotes - 1 },
    }),
    prisma.project.update({
      where: { id: args.id },
      data: { votes: newVotes },
    }),
  ]);
  return { ...project, votes: newVotes };
};
