import { AbiParam } from "@eversdk/core"
import path from "path"
import process from "process"
import { loadJSON } from "../../core/utils"

export class ParamParser {
    pos = 0

    private constructor(public text: string) {}

    static scalar(param: AbiParam, text: string): any {
        const parser = new ParamParser(text)

        return parser.parseScalar(param)
    }

    static components(param: AbiParam, text: string): any {
        const parser = new ParamParser(text)

        return parser.parseComponents(param)
    }

    hasMore() {
        return this.pos < this.text.length
    }

    nextIs(test: (c: string) => boolean): boolean {
        return this.hasMore() && test(this.text[this.pos])
    }

    passIf(test: (c: string) => boolean): boolean {
        if (this.nextIs(test)) {
            this.pos += 1
            return true
        }
        return false
    }

    pass(c: string): boolean {
        return this.passIf(x => x === c)
    }

    passWhile(test: (c: string) => boolean): string | undefined {
        const savePos = this.pos

        while (this.passIf(test)) {} /* eslint-disable-line no-empty */
        return this.pos > savePos
            ? this.text.substring(savePos, this.pos)
            : undefined
    }

    expectIf(
        test: (c: string) => boolean,
        param: AbiParam,
        expectMessage: string,
    ): string {
        const passed = this.passWhile(test)

        if (passed !== undefined) {
            return passed
        }
        throw this.error(
            `Param ${param.name} (${param.type}) expect ${expectMessage}`,
        )
    }

    expect(test: string, param: AbiParam): string {
        return this.expectIf(x => x === test, param, `"${test}"`)
    }

    parseScalar(param: AbiParam): any {
        const isScalarChar = (x: string) =>
            x !== "," && x !== ":" && x !== "[" && x !== "]"
        let quote = ""

        if (this.pass('"')) {
            quote = '"'
        } else if (this.pass("'")) {
            quote = "'"
        }
        if (quote !== "") {
            const value = this.passWhile(x => x !== quote) ?? ""
            this.expect(quote, param)
            return value
        }
        if (!this.nextIs(isScalarChar)) {
            return ""
        }
        return this.expectIf(isScalarChar, param, "value")
    }

    parseArray(param: AbiParam): any[] {
        const item = JSON.parse(JSON.stringify(param)) as AbiParam
        const value = []

        item.type = param.type.slice(0, -2)
        this.expect("[", param)
        while (!this.pass("]")) {
            value.push(this.parseParam(item))
            this.pass(",")
        }
        return value
    }

    parseParam(param: AbiParam): any {
        if (param.type.endsWith("[]")) {
            return this.parseArray(param)
        } else {
            return this.parseScalar(param)
        }
    }

    parseComponents(param: AbiParam): { [name: string]: any } {
        const text = this.text.trim()
        if (text.startsWith("@")) {
            return loadJSON(path.resolve(process.cwd(), text.substring(1)))
        }

        if (text.startsWith("{") && text.endsWith("}")) {
            try {
                return JSON.parse(text)
            } catch (err: any) {
                throw new Error(`Malformed JSON object has been passed`)
            }
        }

        const isLetter = (x: string) => x.toLowerCase() !== x.toUpperCase()
        const isDigit = (x: string) => x >= "0" && x <= "9"
        const isIdent = (x: string) => isLetter(x) || isDigit(x) || x === "_"
        const components = param.components ?? []
        const value: { [name: string]: any } = {}

        while (this.hasMore()) {
            const name = this.expectIf(isIdent, param, "name")
            this.expect(":", param)
            const component = components.find(
                x => x.name.toLowerCase() === name.toLowerCase(),
            )
            if (!component) {
                throw this.error(`Unknown field ${name}`)
            }
            if (param.name in value) {
                throw new Error(`Field "${name}" already defined.`)
            }
            value[name] = this.parseParam(component)
            if (this.hasMore()) {
                this.expect(",", param)
            }
        }
        return value
    }

    private error(message: string) {
        const text = this.text
        const pos = this.pos
        const start = Math.max(pos - 12, 0)
        const end = Math.min(pos + 12, text.length)
        const prefix = start > 0 ? "..." : ""
        const suffix = end < text.length ? "..." : ""
        const context = `"${prefix}${text.substring(
            start,
            pos,
        )} -> ${text.substring(pos, end)}${suffix}"`

        return new Error(`${message} at ${context}`)
    }
}
