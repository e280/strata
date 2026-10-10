
import {deepClone, deepFreeze} from "@e280/stz"
import {Immutable} from "../types.js"

export function immute<S>(s: S) {
	return deepFreeze(deepClone(s)) as Immutable<S>
}

