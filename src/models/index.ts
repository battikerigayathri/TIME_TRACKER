import mercury from "@mercury-js/core";
import {UserSchema} from "./User";
import {ApplicationSchema} from "./Application";

mercury.createList("User", UserSchema);
mercury.createList("Application", ApplicationSchema);
