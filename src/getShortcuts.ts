import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { rules } from '@unocss/preset-wind'
import { compact } from '@zardoy/utils'
import { parseCss } from './parseCss'

export default (position: vscode.Position, document: vscode.TextDocument) => {
    const usedShortcuts = getExtensionSetting('usedShortcuts')
    if (usedShortcuts === 'disable') return 
    const usedShortcutsMode = getExtensionSetting('usedShortcuts.mode')
    const currentLine = document.lineAt(position.line)

    // TODO measure parsing time on big stylesheets
    // TODO check wether we it is parsing when we have existing shorcut word on line (it throws)
    const { usedRules } = parseCss(document.getText(), document.offsetAt(position))
    if (!/^\s*(\w|-)*\s*$/.test(currentLine.text)) return
    const usedRulesOffsets = new Map<string, number>()
    return compact(
        rules
            .filter(rule => typeof rule[0] === 'string' && typeof rule[1] === 'object')
            .map(([shortcut, rule]): vscode.CompletionItem | undefined => {
                const cssRulesArr = (Array.isArray(rule) ? rule : Object.entries(rule))
                    .filter(([prop, value], i, rulesArr) => {
                        if (usedShortcutsMode === 'only-rule' ? usedRules.get(prop) : usedRules.get(prop)?.value === value){
                            usedRulesOffsets.set(shortcut as string, usedRules.get(prop)!.offset)
                            return false
                        }
 
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
                const usedShortcut = cssRulesArr.length === 0
                if (usedShortcut && usedShortcuts === 'remove') return undefined
                const label = shortcut as string
                const cssRules = cssRulesArr.join('\n')

                const currentShortcutOffset = usedRulesOffsets.get(label)

                return {
                    label,
                    insertText: cssRules,
                    tags: usedShortcut ? [vscode.CompletionItemTag.Deprecated] : [],
                    detail: usedShortcut ? `Used on line ${(document.lineAt(document.positionAt(currentShortcutOffset!)).lineNumber + 1).toString()}` : '',
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
