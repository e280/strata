
import {deep} from "@e280/stz"
import {Immutable} from "../types.js"

export function immute<S>(s: S) {
	return deep.freeze(deep.clone(s)) as Immutable<S>
}

