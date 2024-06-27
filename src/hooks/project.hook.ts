import mercury from "@mercury-js/core";
import { getServiceRequestNumber } from "../helpers/generatecode";

mercury.hook.before("CREATE_PROJECT_RECORD", async function (this: any) {
    console.log(this,"data");
    
  this.data.code = getServiceRequestNumber();
});
