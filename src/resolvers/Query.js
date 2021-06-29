const feed = (parent, args, context, info) => {
  const allLinks = context.prisma.link.findMany();
  return allLinks;
};

module.exports = {
  feed,
};
