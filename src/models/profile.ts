import mercury from "@mercury-js/core";
export const Profile = mercury.createModel("Profile", {
  name: {
    type: "string",
  },
  mediaType: {
    type: "enum",
    enumType: "string",
    enum: ["Profile"],
    default: "Profile",
  },
  type: {
    type: "string",
  },
  path: {
    type: "string",
  },
});
