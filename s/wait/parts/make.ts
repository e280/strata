
import {Result} from "@e280/stz"
import {WaitState} from "./type.js"

export function makeWaitState<Value, E = unknown>(result?: Result<Value, E>): WaitState<Value, E> {
	return result
		? {done: true, ...result}
		: {done: false}
}

