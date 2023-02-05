import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { rules } from '@unocss/preset-wind'
import { compact } from '@zardoy/utils'
import { parseCss } from './parseCss'
import { SimpleVirtualDocument } from './shared'

export default ({ fullText, lineText, offset }: SimpleVirtualDocument) => {
    const usedShortcutConfig = {
        main: getExtensionSetting('usedShortcuts.enable'),
        mode: getExtensionSetting('usedShortcuts.mode'),
    }
    const modifySuggestions = getExtensionSetting('modifySuggestions')
    const customRules = Object.entries(getExtensionSetting('customShortcuts')).map(([name, value]) => [
        name,
        value
            .split(';')
            .filter(Boolean)
            .map(line => line.split(':').map(s => s.trim()) as [string, string]),
    ])

    // TODO measure parsing time on big stylesheets
    const { usedRules } = usedShortcutConfig.main === 'disable' ? { usedRules: new Map() } : parseCss(fullText, offset)
    if (!/^\s*(\w|-)*\s*$/.test(lineText)) return
    return compact(
        [...rules, ...customRules]
            .filter(rule => typeof rule[0] === 'string' && typeof rule[1] === 'object')
            .map(([shortcut, rule]): vscode.CompletionItem | undefined => {
                const cssDeclarations = (Array.isArray(rule) ? rule : Object.entries(rule)).filter(([prop, value], i, rulesArr) => {
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

                const cssRules = cssDeclarations.map(([prop, value]) => {
                    if (typeof value === 'number') value = `${value.toString()}px`
                    return `${prop}: ${value};`
                })

                const label = shortcut as string
                const usedShortcut = cssDeclarations.every(([prop, value]) =>
                    usedShortcutConfig.mode === 'only-rule' ? usedRules.get(prop) : usedRules.get(prop)?.value === value,
                )

                if (usedShortcut && usedShortcutConfig.main === 'remove') return undefined
                const cssRulesString = cssRules.join('\n')
                const patch = modifySuggestions[label]
                if (patch === false) return undefined
                return {
                    label: patch?.name ?? label,
                    insertText: cssRulesString,
                    tags: usedShortcut ? [vscode.CompletionItemTag.Deprecated] : [],
                    // TODO button using markdown syntax (replace n rules) and shortcut for replacing these used rules
                    documentation: new vscode.MarkdownString().appendCodeblock(
                        `.${label} {\n${cssDeclarations
                            .map(([prop, value]) => {
                                const rule = `${prop}: ${value};`
                                if (usedShortcutConfig.main === 'disable' || usedShortcutConfig.main === 'remove') return `${' '.repeat(2)}${rule}`

                                const currentShortcutOffset = usedRules.get(prop)?.offset

                                return `${' '.repeat(2)}${rule} ${
                                    (usedShortcutConfig.mode === 'only-rule' ? usedRules.get(prop) : usedRules.get(prop)?.value === value)
                                        ? `//L${getLineByOffset(fullText, currentShortcutOffset)!}`
                                        : ''
                                }`
                            })
                            .join('\n')}\n}`,
                        'css',
                    ),
                    kind: vscode.CompletionItemKind.Event,
                    sortText: patch?.sortText,
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
