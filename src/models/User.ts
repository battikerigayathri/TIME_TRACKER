export const UserSchema = {
  fields: {
    firstName: {
      type: "string",
    },
    lastName: {
      type: "string",
    },
    email: {
      type: "string",
      require: true,
      unique: true,
    },
    organization: {
      type: "string",
    },
    zipcode: {
      type: "string",
    },
    role: {
      type: "enum",
      enumType: "string",
      enum: ["USER", "ADMIN", "SUPERADMIN"],
      default: "USER",
    },
    apps: {
        type: "relationship",
        ref: "Application",
        many: true
    }
  },
  access: {
    default: true,
    acl: [
      {
        SUPERADMIN: {
          read: true,
          create: true,
          update: true,
          delete: true,
        },
      },
      { ADMIN: { create: true, read: true, update: true, delete: true } },
      { EMPLOPYEE: { create: false, read: true, update: true, delete: false } },
      {
        ANONYMOUS: { read: false, update: false, delete: false, create: false },
      },
    ],
  },
};
