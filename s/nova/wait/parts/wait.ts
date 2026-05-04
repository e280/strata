
import {attemptAsync, getOk, Result} from "@e280/stz"

import {makeWait} from "./make.js"
import {signal} from "../../core/signal.js"
import {derived} from "../../core/derived.js"
import {Wait, WaitResult, WaitSignal} from "./type.js"

export function wait<Value, E = unknown>(
		input: Promise<Value> | (() => Promise<Value>),
	) {
	return waitResult<Value, E>(attemptAsync(input))
}

export function waitResult<Value, E = unknown>(
		input: Promise<Result<Value, E>> | (() => Promise<Result<Value, E>>),
	) {
	return waitResultPromise<Value, E>(
		(typeof input === "function")
			? input()
			: input
	)
}

function waitResultPromise<Value, E = unknown>(promise: Promise<Result<Value, E>>) {
	const $wait = signal<Wait<Value, E>>(makeWait<Value, E>())
	const $derived = derived(() => $wait()) as WaitSignal<Value, E>

	$derived.result = promise.then(result => {
		const r: WaitResult<Value, E> = {done: true, ...result}
		$wait(r)
		return r
	})

	$derived.ready = $derived.result.then(getOk)

	return $derived
}

