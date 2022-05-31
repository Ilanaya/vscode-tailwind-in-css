export type Configuration = {
    /**
     * @default true
     */
    enableNumberAbbreviation: boolean
    /**
     * @default true
     */
    enableStaticShortcuts: boolean
    /**
     * @default props
     */
    skipVendorPrefix: 'none' | 'props'
}
