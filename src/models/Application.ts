export const ApplicationSchema = {
  fields: {
    appName: {
      type: "string"
    },
    role: {
      type: "enum",
      enumType: "string",
      enum: ["ACTIVE", "INREVIEW", "CLOSED"],
      default: "INREVIEW",
    },
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
