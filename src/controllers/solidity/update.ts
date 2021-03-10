import {
    loadAvailableVersions,
    SolidityConfig,
    soliditySet,
    solidityUpdate,
} from "./installer";
import {
    Command,
    Terminal,
} from "../../core";

export const solidityUpdateCommand: Command = {
    name: "update",
    title: "Update Solidity Compiler",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await solidityUpdate(terminal);
    },
};

export const soliditySetCommand: Command = {
    name: "set",
    title: "Change Solidity Config",
    args: [
        {
            name: "compiler",
            title: "Compiler version (version number or `latest`)",
            type: "string",
            defaultValue: "",

        },
        {
            name: "linker",
            title: "Linker version (version number or `latest`)",
            type: "string",
            defaultValue: "",

        },
    ],
    async run(terminal: Terminal, args: {
        compiler: string,
        linker: string,
    }): Promise<void> {
        const updates: Partial<SolidityConfig> = {};
        const available = await loadAvailableVersions();
        const latest = {
            compiler: available.compiler[0],
            linker: available.linker[0],
        };
        if (args.compiler !== "") {
            if (args.compiler.toLowerCase() === "latest") {
                updates.compilerVersion = latest.compiler;
            } else {
                if (!available.compiler.includes(args.compiler)) {
                    throw new Error(`Invalid compiler version: ${args.compiler}`);
                }
                updates.compilerVersion = args.compiler;
            }
        }

        if (args.linker !== "") {
            if (args.linker.toLowerCase() === "latest") {
                updates.linkerVersion = latest.linker;
            } else {
                if (!available.linker.includes(args.linker)) {
                    throw new Error(`Invalid linker version: ${args.linker}`);
                }
                updates.linkerVersion = args.linker;
            }
        }

        await soliditySet(terminal, updates);
    },
};

