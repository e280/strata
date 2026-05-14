
import {Err, Ok, Result} from "@e280/stz"
import {Derived} from "../../signals/types.js"

export type WaitPending = {done: false}
export type WaitResult<Value, E = unknown> = {done: true} & Result<Value, E>
export type WaitOk<Value> = {done: true} & Ok<Value>
export type WaitErr<E = unknown> = {done: true} & Err<E>

export type Wait<Value, E = unknown> =
	| WaitPending
	| WaitResult<Value, E>

export type Waiter<Value, E = unknown> = Derived<Wait<Value, E>> & {
	ready: Promise<Value | undefined>
	result: Promise<WaitResult<Value, E>>
}

