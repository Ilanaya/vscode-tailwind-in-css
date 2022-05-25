import * as vscode from 'vscode'
import stringDedent from 'string-dedent'
import { rules } from '@unocss/preset-wind'
import { getExtensionSetting } from 'vscode-framework'

const tailwindNumberAbbreviations: Record<string, (number: number) => string> = {
    px(number) {
        return stringDedent`
        padding-left: ${number}px;
        padding-right: ${number}px;
        `
    },
    py(number) {
        return stringDedent`
        padding-top: ${number}px;
        padding-bottom: ${number}px;
        `
    },
    mx(number) {
        return stringDedent`
        margin-left: ${number}px;
        margin-right: ${number}px;
        `
    },
    my(number) {
        return stringDedent`
        margin-top: ${number}px;
        margin-bottom: ${number}px;
        `
    },
}

export const activate = () => {
    const cssShorthand = /(.+?)(\d+)/
    vscode.workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
        if (vscode.window.activeTextEditor?.document.uri !== document.uri) return
        if (!getExtensionSetting('enableNumberAbbreviation')) return
        if (cssShorthand.test(document.lineAt(contentChanges[0]!.range.end).text.trim())) void vscode.commands.executeCommand('editor.action.triggerSuggest')
        cssShorthand.lastIndex = 0
    })
    vscode.languages.registerCompletionItemProvider(['css', 'scss', 'less', 'vue'], {
        provideCompletionItems(document, position, token, context) {
            if (!position.character) return
            if (!getExtensionSetting('enableStaticShortcuts')) return
            return {
                items: rules
                    .filter(rule => typeof rule[0] === 'string' && typeof rule[1] === 'object')
                    .map(rule => {
                        const rules = Object.entries(rule[1])
                            .map(([prop, value]: [string, string]) => `${prop}: ${value};`)
                            .join('\n')
                        const label = rule[0] as string
                        return {
                            label,
                            insertText: rules,
                            // sortText: "!",
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
            }
        },
    })
    vscode.languages.registerCompletionItemProvider(['css', 'scss', 'less', 'vue'], {
        provideCompletionItems(document, position, token, context) {
            if (!position.character) return
            if (!getExtensionSetting('enableNumberAbbreviation')) return
            const line = document.lineAt(position)
            const match = cssShorthand.exec(line.text.trim())
            cssShorthand.lastIndex = 0
            if (!match) return
            const foundAbbreviation = tailwindNumberAbbreviations[match[1]!]
            if (!foundAbbreviation) return
            let insertText = foundAbbreviation(+match[2]!)
            insertText += '\n'
            return {
                items: [
                    {
                        label: match[0]!,
                        insertText,
                    },
                ],
            }
        },
    })
}
