import * as vscode from 'vscode'
import { getStylesRange } from '@zardoy/vscode-utils/build/styles'
import { getExtensionSetting, registerActiveDevelopmentCommand } from 'vscode-framework'
import getAbbreviations, { abbreviationShorthand } from './abbreviations/getAbbreviations'
import getShortcuts from './getShortcuts'
import { SimpleVirtualDocument } from './shared'

export const activate = () => {
    vscode.workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
        if (vscode.window.activeTextEditor?.document.uri !== document.uri) return
        if (!getExtensionSetting('enableAbbreviation')) return
        const endPosition = contentChanges[0]?.range.end
        if (!endPosition) return

        if (/^\w+(-[\w\d]+)*-\d+$/.test(document.lineAt(endPosition).text.trim())) void vscode.commands.executeCommand('editor.action.triggerSuggest')

        abbreviationShorthand.lastIndex = 0
    })

    vscode.languages.registerCompletionItemProvider(['css', 'scss', 'less', 'vue'], {
        async provideCompletionItems(document, position, token, context) {
            const completions: vscode.CompletionItem[] = []
            // exit early on line start
            if (!position.character) return
            const stylesRange = await getStylesRange(document, position)
            if (!stylesRange) return

            const virtualDocument: SimpleVirtualDocument = {
                fullText: document.getText(stylesRange),
                lineText: document.lineAt(position).text,
                offset: document.offsetAt(position) - document.offsetAt(stylesRange.start),
                startLine: stylesRange.start.line,
            }
            if (getExtensionSetting('enableStaticShortcuts')) completions.push(...(getShortcuts(virtualDocument) ?? []))

            if (getExtensionSetting('enableAbbreviation')) completions.push(...((await getAbbreviations(position, document)) ?? []))

            return { items: completions }
        },
    })

    registerActiveDevelopmentCommand(async () => {
        const editor = vscode.window.activeTextEditor!
        const range = await getStylesRange(editor.document, editor.selection.end)
        console.log(range ? editor.document.getText(range) : 'not raneg')
    })
}
