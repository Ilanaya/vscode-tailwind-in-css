export default [
    ['pointer', 'cursor: pointer'],
    ['absolute', 'position: absolute'],
    ['fixed', 'position: fixed'],
].map(([prop, value]) => [prop, value!.split(': ')]) as Array<[string, [string, string]]>
