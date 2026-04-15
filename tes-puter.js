import { init, getAuthToken } from "@heyputer/puter.js/src/init.cjs";

const authToken = await getAuthToken();
const puter = init(authToken);

const response = await puter.ai.chat("What is Node.js?");
console.log(response.message.content.toString());
