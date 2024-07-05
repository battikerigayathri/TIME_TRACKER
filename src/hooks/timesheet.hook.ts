import mercury from "@mercury-js/core";
mercury.hook.before("CREATE_TIMESHEET_RECORD", async function (this: any) {
  console.log(this.data, "before create");
  const { project, task, user, timeData } = this.data;
  console.log(project, task, user, timeData, "input data");

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  console.log(today);

  const timesheet = await mercury.db.TimeSheet.mongoModel;
  // Find existing timesheet for the same project, task, and user
  const existingTimeSheet = await timesheet.findOne({
    project: project,
    task: task,
    user: user,
  });
  console.log(existingTimeSheet, "today timesheet");
  if (existingTimeSheet) {
    const createdOnDate = new Date(existingTimeSheet.createdOn);
    console.log(createdOnDate, "createdon");
    if (isNaN(createdOnDate.getTime())) {
      throw new Error("Invalid createdOnDate value");
    }
    const createdOnDay = createdOnDate.toISOString().split("T")[0];
    if (createdOnDay === today) {
      existingTimeSheet.timeData = [...existingTimeSheet.timeData, ...timeData];
      await existingTimeSheet.save();
      console.log(existingTimeSheet.timeData, "array(timedata)");

      // Prevent the creation of a new timesheet
      throw new Error(
        "TimeSheet for today exists, updated existing TimeSheet with new TimeData"
      );
    }
  }
});
//  "timeData": ["6686807e16cd88c2cb80343b","6686807c16cd88c2cb803430","66867df902812b3a459f5a71"],
