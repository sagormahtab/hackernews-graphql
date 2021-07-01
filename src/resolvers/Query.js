const feed = async (parent, args, context, info) => {
  const where = args.filter
    ? {
        OR: [
          { description: { contains: args.filter } },
          { url: { contains: args.url } },
        ],
      }
    : {};

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
  });
  const count = await context.prisma.link.count({ where });

  return { links, count };
};

const link = async (parent, args, context) => {
  const desiredLink = context.prisma.link.findFirst({
    where: { id: Number(args.id) },
  });
  return desiredLink;
};

module.exports = {
  feed,
  link,
};
