import mercury from "@mercury-js/core";

const rules = [
    {
        modelName: "User",
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    },
    {
        modelName: "TimeSheet",
        access: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      },
      {
        modelName: "Task",
        access: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      },
      {
        modelName: "Project",
        access: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      },
]

export const EmployeeProfile = mercury.access.createProfile('EMPLOYEE', rules);
