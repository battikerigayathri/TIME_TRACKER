import mercury from "@mercury-js/core";

export const Task = mercury.createModel("Task", {
  name: {
    type: "string",
    require: true,
  },
  project: {
    type: "relationship",
    ref: "Project",
  },
  status: {
    type: "enum",
    enumType: "string",
    enum: ["IN_PROGRESS", "TODO", "DEV_COMPLETE", "DONE"],
    default: "TODO",
  },
});
