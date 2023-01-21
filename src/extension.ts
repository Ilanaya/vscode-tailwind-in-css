import * as vscode from 'vscode'
import { getStylesRange } from '@zardoy/vscode-utils/build/styles'
import { getExtensionSetting, registerActiveDevelopmentCommand } from 'vscode-framework'
import getAbbreviations, { abbreviationShorthand } from './abbreviations/getAbbreviations'
import getShortcuts from './getShortcuts'
import { SimpleVirtualDocument } from './shared'
import getTaggedTemplateLangsStylesRange from './getTaggedTemplateLangsStylesRange'

export const activate = () => {
    vscode.workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
        if (vscode.window.activeTextEditor?.document.uri !== document.uri || !getExtensionSetting('enableAbbreviation')) return
        const endPosition = contentChanges[0]?.range.end
        if (!endPosition) return

        if (/^\w+(-[\w\d]+)*-\d+$/.test(document.lineAt(endPosition).text.trim())) void vscode.commands.executeCommand('editor.action.triggerSuggest')

        abbreviationShorthand.lastIndex = 0
    })
    const taggedTemplateStylesLangs = new Set(['javascript', 'typescript', 'javascriptreact', 'typescriptreact'])

    vscode.languages.registerCompletionItemProvider(['css', 'scss', 'less', 'vue', ...taggedTemplateStylesLangs], {
        async provideCompletionItems(document, position, token, context) {
            const completions: vscode.CompletionItem[] = []
            // exit early on line start
            if (!position.character) return

            const stylesRange = taggedTemplateStylesLangs.has(document.languageId)
                ? await getTaggedTemplateLangsStylesRange(document, position)
                : await getStylesRange(document, position)

            if (!stylesRange) return

            const virtualDocument: SimpleVirtualDocument = {
                fullText: document.getText(stylesRange),
                lineText: document.lineAt(position).text,
                offset: document.offsetAt(position) - document.offsetAt(stylesRange.start),
                position,
                startLine: stylesRange.start.line,
                getWordRangeAtPosition: document.getWordRangeAtPosition,
            }
            if (getExtensionSetting('enableStaticShortcuts')) completions.push(...(getShortcuts(virtualDocument) ?? []))

            if (getExtensionSetting('enableAbbreviation')) completions.push(...((await getAbbreviations(position, document)) ?? []))

            return { items: completions }
        },
    })

    registerActiveDevelopmentCommand(async () => {
        const editor = vscode.window.activeTextEditor!
        const range = await getStylesRange(editor.document, editor.selection.end)
        console.log(range ? editor.document.getText(range) : 'not range')
    })
}
