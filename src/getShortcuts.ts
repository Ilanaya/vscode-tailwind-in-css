import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { rules } from '@unocss/preset-wind'
import { compact } from '@zardoy/utils'
import { parseCss } from './parseCss'
import { SimpleVirtualDocument } from './shared'

export default ({ fullText, lineText, offset, startLine }: SimpleVirtualDocument) => {
    const usedShortcuts = getExtensionSetting('usedShortcuts')
    const usedShortcutsMode = getExtensionSetting('usedShortcuts.mode')

    // TODO measure parsing time on big stylesheets
    const { usedRules } = parseCss(fullText, offset)
    if (!/^\s*(\w|-)*\s*$/.test(lineText)) return
    const usedRulesOffsets = new Map<string, number>()
    return compact(
        rules
            .filter(rule => typeof rule[0] === 'string' && typeof rule[1] === 'object')
            .map(([shortcut, rule]): vscode.CompletionItem | undefined => {
                const cssRulesArr = (Array.isArray(rule) ? rule : Object.entries(rule))
                    .filter(([prop, value], i, rulesArr) => {
                        if (usedShortcuts !== 'disable' && (usedShortcutsMode === 'only-rule' ? usedRules.get(prop) : usedRules.get(prop)?.value === value))
                            usedRulesOffsets.set(shortcut as string, usedRules.get(prop)!.offset)

                        if (getExtensionSetting('skipVendorPrefix') === 'none') return true
                        const hasUnvendoredRule = (current: string, matchUnvendored: (vendorLength: number, unvendored: string) => boolean) => {
                            const match = /^-\w+-/.exec(current)
                            if (!match) return false
                            return matchUnvendored(match[0]!.length, current.slice(match[0]!.length))
                        }

                        return !(
                            hasUnvendoredRule(prop, (vendorLength, unvendored) => rulesArr.some(([rule]) => unvendored === rule.slice(vendorLength)))
                            // hasUnvendored(value as string, match => rulesArr.some(([, value]) => (value as string).slice(match[0]!.length)))
                        )
                    })
                    .map(([prop, value]) => {
                        if (typeof value === 'number') value = `${value.toString()}px`
                        return `${prop}: ${value!};`
                    })

                const label = shortcut as string
                const usedShortcut = usedRulesOffsets.has(label)
                if (usedShortcut && usedShortcuts === 'remove') return undefined
                const cssRules = cssRulesArr.join('\n')

                const currentShortcutOffset = usedRulesOffsets.get(label)
                return {
                    label,
                    insertText: cssRules,
                    tags: usedShortcut ? [vscode.CompletionItemTag.Deprecated] : [],
                    detail: usedShortcut ? `Used on line ${startLine + getLineByOffset(fullText, currentShortcutOffset!)!}` : '',
                    // TODO button using markdown syntax (replace n rules) and shortcut for replacing these used rules
                    documentation: new vscode.MarkdownString().appendCodeblock(
                        `.${label} {\n${cssRules
                            .split('\n')
                            .map(rule => ' '.repeat(2) + rule)
                            .join('\n')}\n}`,
                        'css',
                    ),
                    kind: vscode.CompletionItemKind.Event,
                }
            }),
    )
}

const getLineByOffset = (text: string, offset: number) => {
    let sum = 0
    for (const [i, line] of text.split('\n').entries()) {
        sum += line.length
        if (offset < sum) return i + 1
    }

    return undefined
}
