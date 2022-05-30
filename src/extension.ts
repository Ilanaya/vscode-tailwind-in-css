import * as vscode from 'vscode'
import { rules } from '@unocss/preset-wind'
import { getExtensionSetting } from 'vscode-framework'
import { getNormalizedVueOutline } from '@zardoy/vscode-utils/build/vue'
import getAbbreviations, { abbreviationShorthand } from './getAbbreviations'

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
            // if (document.languageId === 'vue') {
            //     const outline = await getNormalizedVueOutline(document.uri)
            //     if (!outline) {
            //         console.warn('No default vue outline. Install Volar or Vetur')
            //         return
            //     }

            //     const style = outline.find(item => item.name === 'style')
            //     if (!style) return
            //     // check wether position in style.range with style.range.contains
            // }

            if (getExtensionSetting('enableNumberAbbreviation'))
                completions.push(
                    ...rules
                        .filter(rule => typeof rule[0] === 'string' && typeof rule[1] === 'object')
                        .map(rule => {
                            const rules = Object.entries(rule[1])
                                .map(([prop, value]: [string, string]) => `${prop}: ${value};`)
                                .join('\n')
                            const label = rule[0] as string
                            return {
                                label,
                                insertText: rules,
                                documentation: new vscode.MarkdownString().appendCodeblock(
                                    `.${label} {\n${rules
                                        .split('\n')
                                        .map(rule => ' '.repeat(2) + rule)
                                        .join('\n')}\n}`,
                                    'css',
                                ),
                                kind: vscode.CompletionItemKind.Event,
                            }
                        }),
                )

            if (getExtensionSetting('enableStaticShortcuts')) completions.push(...(getAbbreviations(position, document) ?? []))

            return { items: completions }
        },
    })
}
