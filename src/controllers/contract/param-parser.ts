import {AbiParam} from "@tonclient/core";

export class ParamParser {
    pos: number = 0;

    private constructor(public text: string) {
    }

    static scalar(param: AbiParam, text: string): any {
        const parser = new ParamParser(text);
        return parser.parseScalar(param);
    }

    static components(param: AbiParam, text: string): any {
        const parser = new ParamParser(text);
        return parser.parseComponents(param);
    }

    hasMore() {
        return this.pos < this.text.length;
    }

    nextIs(test: (c: string) => boolean): boolean {
        const passed = this.hasMore() && test(this.text[this.pos]);
        if (passed) {
            this.pos += 1;
        }
        return passed;
    }

    pass(test: (c: string) => boolean): string | undefined {
        const savePos = this.pos;
        while (this.nextIs(test)) {
        }
        return this.pos > savePos ? this.text.substring(savePos, this.pos) : undefined;
    }

    expectIf(test: (c: string) => boolean, param: AbiParam, expectMessage: string): string {
        const passed = this.pass(test);
        if (passed !== undefined) {
            return passed;
        }
        throw this.error(`Param ${param.name} (${param.type}) expect ${expectMessage}`);
    }

    expect(test: string, param: AbiParam): string {
        return this.expectIf(x => x === test, param, test);
    }

    parseScalar(param: AbiParam): any {
        const isScalarChar = (x: string) => x !== "," && x !== ":" && x !== "[" && x !== "]";
        return this.expectIf(isScalarChar, param, "value");
    }


    parseArray(param: AbiParam): any[] {
        const item = JSON.parse(JSON.stringify(param)) as AbiParam;
        item.type = param.type.slice(0, -2);
        this.expect("[", param);
        const value = [];
        while (!this.pass(x => x === "]")) {
            value.push(this.parseParam(item));
            this.pass(x => x === ",");
        }
        return value;
    }

    parseParam(param: AbiParam): any {
        if (param.type.endsWith("[]")) {
            return this.parseArray(param);
        } else {
            return this.parseScalar(param);
        }
    }

    parseComponents(param: AbiParam): { [name: string]: any } {
        const components = param.components ?? [];
        const value: { [name: string]: any } = {};
        while (this.hasMore()) {
            const name = this.parseScalar({
                name: "name",
                type: "string",
            });
            this.expect(":", param);
            const component = components.find(x => x.name === name.toLowerCase());
            if (!component) {
                throw this.error(`Unknown field ${name}`);
            }
            if (param.name in value) {
                throw new Error(`Field "${name}" already defined.`);
            }
            value[name] = this.parseParam(component);
        }
        return value;
    }


    private error(message: string) {
        return new Error(`${message}: ${this.text.substr(this.pos)}`);
    }
}
