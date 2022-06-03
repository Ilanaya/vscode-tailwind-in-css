import parseCss from 'postcss/lib/parse'
import Node from 'postcss/lib/node'

const str = `
.fsdklfj[href=","],
.sdkl {
    display: block;
    &:hover
    {
        display: inline;
        
    }
}
`

const parsed = parseCss(str)

parsed.nodes.forEach(node => {
    if (!node.nodes) return
    node.source.offset
    console.log('node', node)
})

const findPositionContainingNode = (position: number) => {
    const find = ({ type, nodes }: Node & { nodes }) => {
        if (position >= nodes.source.start.offset && position <= nodes.source.end.offset) return nodes.source.input.css
        find(nodes.Rule)
    }
}
