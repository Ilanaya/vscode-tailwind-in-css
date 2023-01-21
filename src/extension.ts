import * as vscode from 'vscode'
import { getStylesRange } from '@zardoy/vscode-utils/build/styles'
import { getExtensionSetting, registerActiveDevelopmentCommand } from 'vscode-framework'
import getAbbreviations, { abbreviationShorthand } from './abbreviations/getAbbreviations'
import getShortcuts from './getShortcuts'
import { SimpleVirtualDocument } from './shared'

export const activate = () => {
    vscode.workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
        if (vscode.window.activeTextEditor?.document.uri !== document.uri) return
        if (!getExtensionSetting('enableAbbreviation')) return
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
            const { kindName, start, end } =
                ((await vscode.commands.executeCommand('tsEssentialPlugins.getNodeAtPosition', { offset: document.offsetAt(position) })) as any) ?? {}

            // TODO: make it work in LastTemplateToken cases
            // Tokens explanation:
            // FirstTemplateToken (actually NoSubstitutionTemplateLiteral): css`text|`
            // TemplateHead: css`text|${...}`
            // TemplateMiddle: css`${...}text|${...}`
            // LastTemplateToken: (actually TemplateTail): css`${...}text|`
            const supportedSyntaxKinds = new Set(['FirstTemplateToken', 'TemplateHead', 'TemplateMiddle' /* 'LastTemplateToken ' */])

            const isInTaggedTemplate =
                supportedSyntaxKinds.has(kindName) &&
                /(styled\.[\w\d]+|css)$/.test(document.getText(new vscode.Range(document.positionAt(start).with(undefined, 0), document.positionAt(start))))

            const stylesRange =
                taggedTemplateStylesLangs.has(document.languageId) && isInTaggedTemplate
                    ? new vscode.Range(document.positionAt(start).translate(undefined, 1), document.positionAt(end).translate(undefined, -1))
                    : await getStylesRange(document, position)

            if (!stylesRange) return

            const virtualDocument: SimpleVirtualDocument = {
                fullText: document.getText(stylesRange),
                lineText: document.lineAt(position).text,
                offset: document.offsetAt(position) - document.offsetAt(stylesRange.start),
                startLine: stylesRange.start.line,
            }
            if (getExtensionSetting('enableStaticShortcuts')) completions.push(...(getShortcuts(virtualDocument) ?? []))

            if (getExtensionSetting('enableAbbreviation')) completions.push(...((await getAbbreviations(position, document)) ?? []))

            return { items: completions }
        },
    })

    registerActiveDevelopmentCommand(async () => {
        const editor = vscode.window.activeTextEditor!
        const range = await getStylesRange(editor.document, editor.selection.end)
        console.log(range ? editor.document.getText(range) : 'not raneg')
    })
}
