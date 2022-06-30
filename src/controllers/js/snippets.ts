export const BaseApp = {
    index: `

const {TonClient} = require("@eversdk/core");
const {libNode} = require("@eversdk/lib-node");

TonClient.useBinaryLibrary(libNode);
(async () => {
    const client = new TonClient({
        network: {
            endpoints: ["http://localhost"]
        }
    });
    try {
        await main(client);
    } catch (err) {
        console.error(err);
    }
    client.close();
})();

async function main(client) {
    console.log((await client.client.version()).version);
}

`,
    package: `
{
    "dependencies": {
        "@eversdk/core": "^1",
        "@eversdk/lib-node": "^1"
    }
}
`,
}
