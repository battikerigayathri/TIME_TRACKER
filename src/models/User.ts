import mercury from "@mercury-js/core";

export const User = mercury.createModel("User", {
  userName: {
    type: "string",
    require: true,
  },
  email: {
    type: "string",
    require: true,
  },
  password: {
    type: "string",
    require: true,
  },
  role: {
    type: "enum",
    enumType: "string",
    enum: ["MANAGER", "EMPLOYEE"],
    default: "EMPLOYEE",
  },
  profile: {
    type: "relationship",
    ref: "User",
  },
});
