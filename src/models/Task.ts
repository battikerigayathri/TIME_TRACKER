import mercury from "@mercury-js/core";

export const Task = mercury.createModel(
  "Task",
  {
    name : {
      type : "string",
      require : true
    },

  }
)