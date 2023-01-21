import * as vscode from 'vscode'

export default async (document: vscode.TextDocument, position: vscode.Position) => {
    // TODO: make it work in LastTemplateToken cases
    // Tokens explanation:
    // FirstTemplateToken (actually NoSubstitutionTemplateLiteral): css`text|`
    // TemplateHead: css`text|${...}`
    // TemplateMiddle: css`${...}text|${...}`
    // LastTemplateToken: (actually TemplateTail): css`${...}text|`
    const supportedSyntaxKinds = new Set(['FirstTemplateToken', 'TemplateHead', 'TemplateMiddle' /* 'LastTemplateToken ' */])

    const { kindName, start, end } =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((await vscode.commands.executeCommand('tsEssentialPlugins.getNodeAtPosition', { offset: document.offsetAt(position) })) as any) ?? {}
    const isInTaggedTemplate =
        supportedSyntaxKinds.has(kindName) &&
        /(styled\.[\w\d]+|css)$/.test(document.getText(new vscode.Range(document.positionAt(start).with(undefined, 0), document.positionAt(start))))
    if (!isInTaggedTemplate) return

    return new vscode.Range(document.positionAt(start).translate(undefined, 1), document.positionAt(end).translate(undefined, -1))
}
