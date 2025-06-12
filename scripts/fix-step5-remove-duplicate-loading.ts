import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

async function main() {
    const files = await glob("messages/pages/admin/*.json");
    for (const file of files) {
        const contentRaw = await fs.readFile(file, "utf8");
        const data = JSON.parse(contentRaw);
        if (data.analytics && typeof data.analytics === "object" && "loading" in data.analytics) {
            delete data.analytics.loading;
            await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
            console.log(`✔ Removed analytics.loading from ${path.basename(file)}`);
        }
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}); 