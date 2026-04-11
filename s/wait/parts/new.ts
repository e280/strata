
import {Result} from "@e280/stz"
import {Wait} from "./type.js"

export function newWait<Value, E = unknown>(result?: Result<Value, E>): Wait<Value, E> {
	return result
		? {done: true, ...result}
		: {done: false}
}

