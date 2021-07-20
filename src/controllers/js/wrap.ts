import {
    Command,
    CommandArgVariant,
    Terminal,
} from "../../core";
import path from "path";
import {TonClient} from "@tonclient/core";
import {resolveContract, writeStringToFile} from "../../core/utils";

enum ExportFormat {
    CommonJs = "commonjs",
    CommonJsDefault = "commonjs-default",
    Es6 = "es6",
    Es6Default = "es6-default",
}

function getExportSection(exportFormat: ExportFormat, name: string): string {
    switch (exportFormat) {
    case ExportFormat.CommonJs:
        return `module.exports = { ${name} };`;
    case ExportFormat.CommonJsDefault:
        return `module.exports = ${name};`;
    case ExportFormat.Es6:
        return `export ${name};`;
    case ExportFormat.Es6Default:
        return `export default ${name};`;
    }
    throw new Error(`Invalid JS export mode ${exportFormat}`);
}

export const jsWrapCommand: Command = {
    name: "wrap",
    alias: "w",
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
            defaultValue: "",
        },
        {
            name: "export",
            alias: "e",
            type: "string",
            title: "Export type and options",
            getVariants(): CommandArgVariant[] {
                return [
                    {
                        value: "commonjs",
                        description: "Use CommonJS modules (NodeJs)",
                    },
                    {
                        value: "commonjs-default",
                        description: "Use CommonJS modules (NodeJS) with default export",
                    },
                    {
                        value: "es6",
                        description: "Use ES6 modules",
                    },
                    {
                        value: "es6-default",
                        description: "Use ES6 modules with default export",
                    },
                ];
            },
            defaultValue: ExportFormat.CommonJs,
        },
    ],
    run: async function (terminal: Terminal, args: {
        file: string,
        print: boolean,
        output: string,
        export: string,
    }) {
        const contract = resolveContract(path.resolve(process.cwd(), args.file));
        const name = path.basename(contract.abiPath).slice(0, -".abi.json".length);
        const abi = contract.package.abi;
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
        const tvc = contract.package.tvc;
        if (tvc !== undefined) {
            code.push(`    tvc: "${tvc}",`);
            const client = new TonClient();
            const tvcCode = (await client.boc.get_code_from_tvc({tvc})).code;
            code.push(`    code: "${tvcCode}",`);
            code.push(`    codeHash: "${(await client.boc.get_boc_hash({boc: tvcCode})).hash}",`);
            await client.close();
        }
        code.push("};");
        code.push(getExportSection(args.export.toLowerCase() as ExportFormat, contractName));
        const wrapperCode = code.join("\n");
        if (args.print) {
            terminal.log(wrapperCode);
        } else {
            const wrapperPath = path.resolve(
                path.dirname(contract.abiPath),
                args.output !== "" ? args.output : `${contractName}.js`,
            );
            writeStringToFile(wrapperPath, wrapperCode);
            terminal.log(`Generated wrapper code written to: ${wrapperPath}`);
        }
    },
};

