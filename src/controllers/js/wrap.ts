import {
    Command,
    Terminal,
} from "../../core";
import * as fs from "fs";
import * as path from "path";

function getExportSection(exportFormat: string, name: string): string {
    switch (exportFormat.toLowerCase()) {
    case "node":
        return `module.export = { ${name} };`;
    case "node-default":
        return `module.export = ${name};`;
    case "es":
        return `export ${name};`;
    case "es-default":
        return `export default ${name};`;
    }
    throw new Error(`Invalid JS export mode ${exportFormat}`);
}

export const jsWrapCommand: Command = {
    name: "wrap",
    title: "Wrap ABI file into JavaScript code.",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "ABI file",
            nameRegExp: /\.abi\.json$/i,
        },
        {
            name: "print",
            alias: "p",
            type: "boolean",
            title: "Print code to console",
            defaultValue: "false",
        },
        {
            name: "output",
            alias: "o",
            type: "string",
            title: "Set output file name (default is built from source ABI file name)",
            defaultValue: "false",
        },
        {
            name: "export",
            alias: "e",
            type: "string",
            title: "Export type and options",
            getVariants(): { name: string; description?: string }[] {
                return [
                    {
                        name: "node",
                        description: "Use NodeJs modules",
                    },
                    {
                        name: "node-default",
                        description: "Use NodeJs modules with default export",
                    },
                    {
                        name: "es",
                        description: "Use ES modules",
                    },
                    {
                        name: "es-default",
                        description: "Use ES modules with default export",
                    },
                ];
            },
            defaultValue: "node",
        },
    ],
    async run(terminal: Terminal, args: {
        file: string,
        print: boolean,
        output: string,
        export: string,
    }) {
        const abiPath = path.resolve(process.cwd(), args.file);
        const name = path.basename(abiPath).slice(0, -".abi.json".length);
        const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
        const contractName = `${name.substr(0, 1).toUpperCase()}${name.substr(1)}Contract`;
        const code = [`const ${contractName} = {`];
        const abiCode = JSON
            .stringify(abi, undefined, "    ")
            .split("\r\n")
            .join("\n")
            .split("\n")
            .map((x, i) => i > 0 ? `    ${x}` : x)
            .join("\n");

        code.push(`    abi: ${abiCode},`);
        const tvcPath = path.resolve(path.dirname(abiPath), `${name}.tvc`);
        terminal.log(tvcPath);
        if (fs.existsSync(tvcPath)) {
            code.push(`    tvc: "${fs.readFileSync(tvcPath).toString("base64")}",`);
        }
        code.push("};");
        code.push(getExportSection(args.export, contractName));
        const wrapperCode = code.join("\n");
        if (args.print) {
            terminal.log(wrapperCode);
        } else {
            const wrapperPath = path.resolve(path.dirname(abiPath), `${contractName}.js`);
            fs.writeFileSync(wrapperPath, wrapperCode);
            terminal.log(`Generated wrapper code written to: ${wrapperPath}`);
        }
    },
};

