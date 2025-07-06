
import {Options} from "../types.js"

export const processOptions = (options: Partial<Options>): Options => ({
	clone: options.clone ?? (<X>(x: X) => structuredClone(x)),
})

