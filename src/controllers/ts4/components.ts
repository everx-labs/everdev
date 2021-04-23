import os from 'os'
import { Component, Terminal } from '../../core'
import { compareVersions, httpsGetJson, nullTerminal, run } from '../../core/utils'

const TS4_PKG = 'tonos-ts4'
const PYPI = `https://pypi.org/pypi/${TS4_PKG}/json`
const currentOS = os.type()
const [PYTHON, PIP] = ['Linux', 'Darwin'].includes(currentOS)
    ? ['python3', 'pip3']
    : ['python', 'pip']

export const components = {
    ts4: new class extends Component {
        async getCurrentVersion(): Promise<string> {
            let version

            try {
                const output = await run(PIP, ['show', TS4_PKG], {}, nullTerminal)
                version = output.split(os.EOL).find(line => (/^Version:/).exec(line))
            } catch {
                // TODO handle the lack of 'pip'
                console.debug(`Package ${TS4_PKG} not found`)
            }
            return version ? version.split(/:\s*/)[1] : ''
        }

        async ensureVersion(
            terminal: Terminal,
            force: boolean,
            requiredVersion?: string,
        ): Promise<boolean> {
            const current = await this.getCurrentVersion();
            if (!force && current !== "" && !requiredVersion) {
                return false;
            }
            let version = (requiredVersion ?? "latest").toLowerCase();
            if (!force && version === current) {
                return false;
            }
            const available = await this.loadAvailableVersions();
            if (version === "latest") {
                version = available[0];
            } else {
                if (!available.includes(version)) {
                    throw new Error(`Invalid ${this.name} version ${version}`);
                }
            }
            if (!force && version === current) {
                return false;
            }
            const sourceName = this.getSourceName(version);
            const output = (await run(PIP, ['install', '-U', TS4_PKG], {}, nullTerminal)).split(os.EOL)
            const successPattern = `Successfully installed ${TS4_PKG}-${version}`
            const isOk = output.find(line => line === successPattern)

            if (!isOk) {
                console.error(`Failed to install ${TS4_PKG}==${version}`)
                return false
            }

            const info = {
                version: await this.resolveVersion(version),
            }
            return true
        }

        async loadAvailableVersions(): Promise<string[]> {
            const info = await httpsGetJson(PYPI)
            const versions = Object.keys(info.releases)
                .filter(v => (/^(\d+\.){2}\d+$/).test(v))
                .sort(compareVersions)
                .reverse()
            return versions.length < 10 ? versions : [...versions.slice(0, 10), "..."]
        }
    }('', PYTHON, {
        executable: true,
        globally: true,
    }),
}