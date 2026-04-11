
import {Result} from "@e280/stz"
import {Derived} from "../../signals/index.js"

export type Wait<Value, E = unknown> =
	| {done: false}
	| {done: true} & Result<Value, E>

export type WaitSignal<Value, E = unknown> =
	& {
		done: Promise<Value | undefined>
		result: Promise<Result<Value, E>>
	}
	& Derived<Wait<Value, E>>

