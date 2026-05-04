
import {Err, Ok, Result} from "@e280/stz"
import {Derived} from "../../core/types.js"

export type WaitPending = {done: false}
export type WaitDone<Value, E = unknown> = {done: true} & Result<Value, E>
export type WaitOk<Value> = {done: true} & Ok<Value>
export type WaitErr<E = unknown> = {done: true} & Err<E>

export type Wait<Value, E = unknown> =
	| WaitPending
	| WaitDone<Value, E>

export type WaitSignal<Value, E = unknown> =
	& {
		ready: Promise<Value | undefined>
		result: Promise<WaitDone<Value, E>>
	}
	& Derived<Wait<Value, E>>

