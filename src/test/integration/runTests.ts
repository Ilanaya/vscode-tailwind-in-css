import { join } from 'path'
import { runTests } from '@vscode/test-electron'

async function main() {
    try {
        await runTests({
            version: 'insiders',
            extensionDevelopmentPath: join(__dirname, '../out'),
            extensionTestsPath: join(__dirname, './index'),
            launchArgs: [],
        })
    } catch (error) {
        console.error(error)
        console.error('Failed to run tests')
        process.exit(1)
    }
}

void main()
