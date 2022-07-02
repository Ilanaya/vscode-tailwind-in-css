/* eslint-disable curly */
import postcssParser from 'postcss/lib/parse'
import Node from 'postcss/lib/node'
import Rule from 'postcss/lib/rule'
import { Declaration } from 'postcss'

export const parseCss = (stylesContent: string, offset: number) => {
    const usedRules = new Map<string, { value: string; offset: number }>()
    try {
        const parsed = postcssParser(stylesContent)
        const findPositionContainingNode = (position: number, nodes: Node[]) => {
            let currentNode: Node | undefined
            const find = (nodes: Node[]) => {
                for (const node of nodes)
                    if (position >= node.source!.start!.offset && position <= node.source!.end!.offset) {
                        if ('nodes' in node) {
                            currentNode = node
                            find((node as any).nodes)
                        }

                        break
                    }
            }

            find(nodes)
            return currentNode
        }

        const foundNode = findPositionContainingNode(offset, parsed.nodes)

        if (foundNode instanceof Rule) {
            for (const node of foundNode.nodes)
                if (node instanceof Declaration) {
                    usedRules.set(node.prop, { value: node.value, offset: node.source!.start!.offset })
                }
        }
    } catch {
        // console.debug('thrown', error)
    }

    return {
        usedRules,
    }
}
