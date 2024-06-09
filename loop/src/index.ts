import {commandOptions, createClient} from "redis"
import { downloadFromS3, uploadToS3 } from "./aws";

const subscriber = createClient();

subscriber.connect(); 

async function main() {
    while(1) {
        console.log("called");
        const res = await subscriber.brPop(
            commandOptions({isolated : true}),
            "videoIds",
            0
        )
        console.log(res);
        const key = res?.element;
        downloadFromS3(String(key));
    }
}

main();