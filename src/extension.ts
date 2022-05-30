import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { getNormalizedVueOutline } from '@zardoy/vscode-utils/build/vue'
import getAbbreviations, { abbreviationShorthand } from './getAbbreviations'
import getShortcuts from './getShortcuts'

export const activate = () => {
    vscode.workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
        if (vscode.window.activeTextEditor?.document.uri !== document.uri) return
        if (!getExtensionSetting('enableNumberAbbreviation')) return
        const endPosition = contentChanges[0]?.range.end
        if (!endPosition) return

        if (abbreviationShorthand.test(document.lineAt(endPosition).text.trim())) void vscode.commands.executeCommand('editor.action.triggerSuggest')

        abbreviationShorthand.lastIndex = 0
    })

    vscode.languages.registerCompletionItemProvider(['css', 'scss', 'less', 'vue'], {
        async provideCompletionItems(document, position, token, context) {
            const completions: vscode.CompletionItem[] = []
            if (!position.character) return
            if (document.languageId === 'vue') {
                const outline = await getNormalizedVueOutline(document.uri)
                if (!outline) {
                    console.warn('No default vue outline. Install Volar or Vetur')
                    return
                }

                const style = outline.find(item => item.name === 'style')
                if (!style) return
                if (!style.range.contains(position)) return
            }

            if (getExtensionSetting('enableStaticShortcuts')) completions.push(...(getShortcuts(position, document) ?? []))

            if (getExtensionSetting('enableNumberAbbreviation')) completions.push(...(getAbbreviations(position, document) ?? []))

            return { items: completions }
        },
    })
}
