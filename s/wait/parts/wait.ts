
import {attemptAsync, getOk, Result} from "@e280/stz"

import {makeWait} from "./make.js"
import {signal} from "../../signals/signal.js"
import {derived} from "../../signals/derived.js"
import {Wait, WaitResult, Waiter} from "./type.js"

export function wait<Value, E = unknown>(
		input: Promise<Value> | (() => Promise<Value>),
	) {
	return waitFormal<Value, E>(attemptAsync(input))
}

export function waitFormal<Value, E = unknown>(
		input: Promise<Result<Value, E>> | (() => Promise<Result<Value, E>>),
	) {
	return waitFormalPromise<Value, E>(
		(typeof input === "function")
			? input()
			: input
	)
}

function waitFormalPromise<Value, E = unknown>(promise: Promise<Result<Value, E>>) {
	const $wait = signal<Wait<Value, E>>(makeWait<Value, E>())
	const $derived = derived(() => $wait()) as Waiter<Value, E>

	$derived.result = promise.then(result => {
		const r: WaitResult<Value, E> = {done: true, ...result}
		$wait(r)
		return r
	})

	$derived.ready = $derived.result.then(getOk)

	return $derived
}

