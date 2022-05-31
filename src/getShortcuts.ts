import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { rules } from '@unocss/preset-wind'

export default (position: vscode.Position, document: vscode.TextDocument) => {
    const currentLine = document.lineAt(position.line)
    const colonIndex = currentLine.text.indexOf(':')
    if (colonIndex !== -1) return
    return rules
        .filter(rule => typeof rule[0] === 'string' && typeof rule[1] === 'object')
        .map(([shortcut, rule]) => {
            const rules = (Array.isArray(rule) ? rule : Object.entries(rule))
                .filter(([prop, value], i, rulesArr) => {
                    if (getExtensionSetting('skipVendorPrefix') === 'none') return true
                    const hasUnvendored = (current: string, matchUnvendored: (vendorLength: number, unvendored: string) => boolean) => {
                        const match = /^-\w+-/.exec(current)
                        if (!match) return false
                        return matchUnvendored(match[0]!.length, current.slice(match[0]?.length))
                    }

                    return !(
                        hasUnvendored(prop, (vendorLength, unvendored) => rulesArr.some(([rule]) => unvendored === rule.slice(vendorLength)))
                        // hasUnvendored(value as string, match => rulesArr.some(([, value]) => (value as string).slice(match[0]!.length)))
                    )
                })
                .map(([prop, value]) => {
                    if (typeof value === 'number') value = `${value.toString()}px`
                    return `${prop}: ${value!};`
                })
                .join('\n')
            const label = shortcut as string
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
