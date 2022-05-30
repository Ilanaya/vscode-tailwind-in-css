import * as vscode from 'vscode'
import { rules } from '@unocss/preset-wind'

export default (position: vscode.Position, document: vscode.TextDocument) => {
    const currentLine = document.lineAt(position.line)
    return rules
        .filter(rule => typeof rule[0] === 'string' && typeof rule[1] === 'object' && rule[0].startsWith(currentLine.text.trim()))
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
        })
}
