import mercury from "@mercury-js/core";
import { getServiceRequestNumber } from "../helpers/generatecode";

export const Project = mercury.createModel("Project", {
  name: {
    type: "string",
    require: true,
  },
  type: {
    type: "enum",
    enumType: "string",
    enum: ["EXTERNAL", "INTERNAL"],
  },
  description: {
    type:"string",
  },
  status: {
    type: "enum",
    enumType: "string",
    enum: ["ACTIVE", "INACTIVE"],
  },
  assignedTo: {
    type: "relationship",
    ref: "User",
    many: true,
  },
  assignedBy: {
    type: "relationship",
    ref: "User",
  },
  estimatedTime: {
    type: "number",
  },
  code: {
    type: "string",
    default: getServiceRequestNumber,
  },
  task: {
    type: "virtual",
    ref: "Task",
    localField: "_id",
    foreignField: "project",
    many: true,
    isEditable: false,
  },
});