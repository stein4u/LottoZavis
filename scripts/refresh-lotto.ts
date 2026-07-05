import { incrementalRefresh } from "../server/lotto/ingest.js";

const result = await incrementalRefresh();
console.log(JSON.stringify(result, null, 2));
