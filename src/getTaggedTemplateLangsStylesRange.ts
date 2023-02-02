import * as vscode from 'vscode'

export default async (document: vscode.TextDocument, position: vscode.Position) => {
    try {
        // Tokens explanation:
        // FirstTemplateToken (actually NoSubstitutionTemplateLiteral): css`text|`
        // TemplateHead: css`text|${...}`
        // TemplateMiddle: css`${...}text|${...}`
        // LastTemplateToken: (actually TemplateTail): css`${...}text|`
        const supportedSyntaxKinds = new Set(['FirstTemplateToken', 'TemplateHead', 'TemplateMiddle', 'LastTemplateToken'])

        const nodes =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((await vscode.commands.executeCommand('tsEssentialPlugins.getNodePath', { offset: document.offsetAt(position) })) as any) ?? {}

        const { start, end, kindName } = nodes[nodes.length - 1]
        if (!supportedSyntaxKinds.has(kindName)) return

        const { start: templateExprStart } = nodes.find(({ kindName }) => kindName === 'TemplateExpression' || kindName === 'FirstTemplateToken')

        const templateStartPos = document.positionAt(templateExprStart)
        const isInTaggedTemplate = /(styled\.[\w\d]+|css)$/.test(document.getText(new vscode.Range(templateStartPos.with(undefined, 0), templateStartPos)))
        if (!isInTaggedTemplate) return

        return new vscode.Range(document.positionAt(start), document.positionAt(end))
    } catch (error) {
        console.error(error)
        return undefined
    }
}
