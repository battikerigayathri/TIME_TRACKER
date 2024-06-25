import mercury from "@mercury-js/core";

export const Project = mercury.createModel(
  "Project",
  {
    name : {
      type : "string",
      require : true
    },
    type : {
      type :"enum",
      enumType : "string",
      enum : ["EXTERNAL","INTERNAL"],
    },
    status : {
        type :"enum",
        enumType : "string",
        enum : ["ACTIVE","INACTIVE"],
      },
      task: {
        type: "relationship",
        ref: "Task",
        many: true,
      },
    user : {
        type : "relationship",
        ref : "User"
      },
  }
)