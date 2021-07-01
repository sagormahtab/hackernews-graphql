const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.user.create({
    data: { ...args, password },
  });
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
}

async function login(parent, args, context, info) {
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  });
  if (!user) {
    throw new Error("No such user found");
  }

  const isValid = await bcrypt.compare(args.password, user.password);
  if (!isValid) {
    throw new Error("Invalid password");
  }
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
}

async function post(parent, args, context, info) {
  const { userId } = context;

  const newLink = await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    },
  });
  context.pubsub.publish("NEW_LINK", newLink);

  return newLink;
}

async function updateLink(parent, args, context) {
  const userId = getUserId(context);
  const link = context.prisma.link.findFirst({
    where: {
      postedById: userId,
    },
  });
  if (!Boolean(link)) {
    throw new Error(`This link is not created by user ${userId}`);
  }

  const data = {};

  if (args.url) {
    data.url = args.url;
  }
  if (args.description) {
    data.description = args.description;
  }

  const desiredLink = context.prisma.link.update({
    where: { id: Number(args.id) },
    data: data,
  });
  return desiredLink;
}

async function deleteLink(parent, args, context) {
  const userId = getUserId(context);
  const link = context.prisma.link.findFirst({
    where: {
      postedById: userId,
    },
  });
  if (!Boolean(link)) {
    throw new Error(`This link is not created by user ${userId}`);
  }

  const desiredLink = context.prisma.link.delete({
    where: { id: Number(args.id) },
  });
  return desiredLink;
}

async function vote(parent, args, context, info) {
  const userId = getUserId(context);
  const vote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId: userId,
      },
    },
  });

  if (Boolean(vote)) {
    throw new Error(`Already voted for link ${args.linkId}`);
  }

  const newVote = context.prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: Number(args.linkId) } },
    },
  });
  context.pubsub.publish("NEW_VOTE", newVote);
  return newVote;
}

module.exports = {
  signup,
  login,
  post,
  updateLink,
  deleteLink,
  vote,
};
