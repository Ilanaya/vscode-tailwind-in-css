import * as vscode from 'vscode'
import { expect } from 'chai'
import delay from 'delay'

describe('CSS-in-JS', () => {
    // todo make optional with is-online
    it('works', async function () {
        // installing extension takes a lot of time
        this.timeout(7000)
        const file = /* tsx */ `
            css\`
                display: flex;
                \${'...'/* absolutely don't care */}
                color: red;
                \${'...'/* absolutely don't care */}
                display: body;
                flex|
                \${'...'/* absolutely don't care */}
            \`
        `
        // workaround for error: missing gallery
        await delay(1000)
        try {
            await vscode.commands.executeCommand('workbench.extensions.installExtension', 'zardoy.ts-essential-plugins')
        } catch (error) {
            if (!error.message.includes('Missing gallery')) throw new Error(error)
            await delay(1500)
            await vscode.commands.executeCommand('workbench.extensions.installExtension', 'zardoy.ts-essential-plugins')
        }

        const config = vscode.workspace.getConfiguration('tailwindInCss')
        await config.update('usedShortcuts.mode', 'only-rule', true)
        const pos = file.indexOf('|')
        const fileToParse = file.slice(0, pos) + file.slice(pos + 1)
        const editor = await vscode.window.showTextDocument(await vscode.workspace.openTextDocument({ language: 'typescriptreact', content: fileToParse }))
        const { document } = editor
        const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            document.uri,
            document.positionAt(pos),
        )
        const items = completions?.items.map(({ label }) => label)
        // check that array includes item with chai
        expect(items).to.contain('animate-none')
        expect(completions.items.find(item => item.label === 'flex')?.tags?.[0]).to.equal(vscode.CompletionItemTag.Deprecated)
    })
})
