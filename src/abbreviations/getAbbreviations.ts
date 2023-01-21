import * as vscode from 'vscode'
import { getCssAbreviationFromLine } from './unocssAbreviations'

// limit support to number-based abbreviations for now
export const abbreviationShorthand = /^\w+(-[\w\d]+)+$/

// vscode wrapper
export default async (position: vscode.Position, document: vscode.TextDocument): Promise<vscode.CompletionItem[] | void> => {
    const line = document.lineAt(position)
    const lineText = line.text.trim()
    const match = abbreviationShorthand.exec(lineText)
    abbreviationShorthand.lastIndex = 0
    if (!match) return
    const insertCss = await getCssAbreviationFromLine(lineText)
    if (!insertCss) return
    return [
        {
            label: match[0]!,
            insertText: insertCss,
            sortText: '0',
            documentation: new vscode.MarkdownString().appendCodeblock(
                `.${match[0]!} {\n${insertCss
                    .split('\n')
                    .map(str => `${' '.repeat(2)}${str}`)
                    .join('\n')}\n}`,
                'css',
            ),
            range: document.getWordRangeAtPosition(position, /[-\w\d]+/),
        },
    ]
}
