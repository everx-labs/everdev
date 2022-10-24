import fs from "fs"
import path from "path"
import { run } from "../core/utils"
import { Terminal } from "../core"

export async function update(terminal: Terminal) {
    const pkg = JSON.parse(
        fs.readFileSync(
            path.resolve(__dirname, "..", "..", "package.json"),
            "utf8",
        ),
    )
    terminal.log(`Updating globally-installed package ${pkg.name}`)
    try {
        await run("npm", ["update", "-g", pkg.name], {}, terminal)
    } catch (err: any) {
        const message = [
            `An error occurred while trying to update ${pkg.name} globally`,
            "",
            `If you installed everdev with sudo, run "sudo update -g ${pkg.name}"`,
            "",
            "Advice: it is always possible to install packages globally without sudo,",
            "here you can learn how: https://github.com/nvm-sh/nvm#node-version-manager---",
        ].join("\n")
        throw Error(message)
    }
}
