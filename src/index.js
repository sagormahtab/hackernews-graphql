const { ApolloServer } = require("apollo-server");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async (parent, args, context, info) => {
      const allLinks = context.prisma.link.findMany();
      return allLinks;
    },
    link: async (parent, args, context) => {
      const desiredLink = context.prisma.link.findFirst({
        where: { id: parseInt(args.id) },
      });
      return desiredLink;
    },
  },
  Mutation: {
    post: (parent, args, context, info) => {
      const newLink = context.prisma.link.create({
        data: {
          description: args.description,
          url: args.url,
        },
      });
      return newLink;
    },
    updateLink: (parent, args, context) => {
      const data = {};

      if (args.url) {
        data.url = args.url;
      }
      if (args.description) {
        data.description = args.description;
      }

      const desiredLink = context.prisma.link.update({
        where: { id: parseInt(args.id) },
        data: data,
      });
      return desiredLink;
    },
    deleteLink: (parent, args, context) => {
      const desiredLink = context.prisma.link.delete({
        where: { id: parseInt(args.id) },
      });
      return desiredLink;
    },
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
  resolvers,
  context: {
    prisma,
  },
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
