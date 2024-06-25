import mercury from "@mercury-js/core";

export const TimeSheet = mercury.createModel(
  "TimeSheet",
  {
   project : {
    type : "relationship",
    ref : "Project"
   },
   description : {
    type : "string",
    require : true
   },
   task : {
    type : "relationship",
    ref : "Task"
   },
   user: {
    type: "relationship",
    ref: "User",
  },
//   timeData : {
//     type : "string",
//     many : true
//   } create another model and give ref for this 
  }
)