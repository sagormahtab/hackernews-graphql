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

  return await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    },
  });
}

async function updateLink(parent, args, context) {
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
}

async function deleteLink(parent, args, context) {
  const desiredLink = context.prisma.link.delete({
    where: { id: parseInt(args.id) },
  });
  return desiredLink;
}

module.exports = {
  signup,
  login,
  post,
  updateLink,
  deleteLink,
};
