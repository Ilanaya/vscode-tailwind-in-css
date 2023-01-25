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

        if (!supportedSyntaxKinds.has(nodes[nodes.length - 1].kindName)) return

        const { start: templateExprStart, end: templateExprEnd } = nodes.find(
            ({ kindName }) => kindName === 'TemplateExpression' || kindName === 'FirstTemplateToken',
        )

        const isInTaggedTemplate = /(styled\.[\w\d]+|css)$/.test(
            document.getText(new vscode.Range(document.positionAt(templateExprStart).with(undefined, 0), document.positionAt(templateExprStart))),
        )
        if (!isInTaggedTemplate) return

        return new vscode.Range(document.positionAt(templateExprStart).translate(undefined, 1), document.positionAt(templateExprEnd).translate(undefined, -1))
    } catch {
        return null
    }
}
