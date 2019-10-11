//authentication/permissions solution from https://www.youtube.com/watch?v=LnOemRSax4A&feature=youtu.be
const createResolver = resolver => {
  const baseResolver = resolver;
  baseResolver.createResolver = childResolver => {
    const newResolver = async (parent, args, context) => {
      await resolver(parent, args, context);
      return childResolver(parent, args, context);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

const requiresAuth = createResolver((parent, args, context) => {
  if (!context.user) {
    console.log("no user in context");
    throw new Error("Not authenticated");
  }
});

const requiresAdmin = requiresAuth.createResolver((parent, args, context) => {
  if (!context.user.isAdmin) {
    throw new Error("Requires admin access");
  }
});

module.exports = {
  requiresAuth,
  requiresAdmin
};
