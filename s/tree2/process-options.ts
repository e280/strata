
import {TreeOptions} from "./types.js"

export const processOptions = (options: Partial<TreeOptions> = {}): TreeOptions => ({
	clone: options.clone ?? (<X>(x: X) => structuredClone(x)),
})

