import mercury from "@mercury-js/core";

export const TimeData = mercury.createModel(
  "TimeData",
  {
    startTime : {
      type : "string",
      require : true
    },
    endTime : {
        type : "string",
        require : true
      },

  }
)