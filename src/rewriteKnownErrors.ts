export function rewriteKnownErrors(err: unknown) {
    let presumableError = ""

    if (err instanceof Error) {
        if (/dyld: Symbol not found/.test(err.message)) {
            presumableError = "Wrong Mac OS version"
        }

        if (presumableError !== "") {
            err.message = `${presumableError} (presumably)\nOriginal error:${err.message}`
        }
    }
    return err
}
