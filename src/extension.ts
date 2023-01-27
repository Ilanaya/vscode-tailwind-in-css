import * as vscode from 'vscode'
import { getStylesRange } from '@zardoy/vscode-utils/build/styles'
import { getExtensionSetting } from 'vscode-framework'
import getAbbreviations from './abbreviations/getAbbreviations'
import getShortcuts from './getShortcuts'
import { SimpleVirtualDocument } from './shared'
import getTaggedTemplateLangsStylesRange from './getTaggedTemplateLangsStylesRange'

export const activate = () => {
    const taggedTemplateStylesLangs = new Set(['javascript', 'typescript', 'javascriptreact', 'typescriptreact'])

    let previousStaticShortcuts: vscode.CompletionItem[] | undefined
    vscode.languages.registerCompletionItemProvider(['css', 'scss', 'less', 'vue', ...taggedTemplateStylesLangs], {
        async provideCompletionItems(document, position, token, context) {
            const completions: vscode.CompletionItem[] = []
            // exit early on line start
            if (!position.character) return

            // todo cache stylesRange in the same way as previousStaticShortcuts
            const stylesRange = taggedTemplateStylesLangs.has(document.languageId)
                ? await getTaggedTemplateLangsStylesRange(document, position)
                : await getStylesRange(document, position)

            if (!stylesRange) return

            const completionRange = document.getWordRangeAtPosition(position, /[-\w\d]+/)
            if (getExtensionSetting('enableStaticShortcuts')) {
                if (!previousStaticShortcuts || context.triggerKind !== vscode.CompletionTriggerKind.TriggerForIncompleteCompletions) {
                    const virtualDocument: SimpleVirtualDocument = {
                        fullText: document.getText(stylesRange),
                        lineText: document.lineAt(position).text,
                        offset: document.offsetAt(position) - document.offsetAt(stylesRange.start),
                        position,
                        startLine: stylesRange.start.line,
                    }
                    // for now there is no data is changed in virtualDocument between keystrokes (except for some edge cases, such as api edits)
                    const shortcuts = getShortcuts(virtualDocument)
                    previousStaticShortcuts = shortcuts
                }

                completions.push(...(previousStaticShortcuts ?? []))
            }

            const abbreviationsEnabled = getExtensionSetting('enableAbbreviation')
            if (abbreviationsEnabled) completions.push(...((await getAbbreviations(position, document)) ?? []))

            return {
                items: completions.map(completion => ({
                    ...completion,
                    range: completionRange,
                })),
                // todo use different providers for different completion types when vscode bug is fixed
                isIncomplete: abbreviationsEnabled,
            }
        },
    })
}
