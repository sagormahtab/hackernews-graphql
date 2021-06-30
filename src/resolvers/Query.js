const feed = (parent, args, context, info) => {
  const allLinks = context.prisma.link.findMany();
  return allLinks;
};

const link = async (parent, args, context) => {
  const desiredLink = context.prisma.link.findFirst({
    where: { id: parseInt(args.id) },
  });
  return desiredLink;
};

module.exports = {
  feed,
  link,
};
