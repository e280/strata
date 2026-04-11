
import {derived, signal} from "@e280/strata"
import {attemptAsync, getOk, Result} from "@e280/stz"
import {newWait} from "./new.js"
import {Wait, WaitDone, WaitSignal} from "./type.js"

export function wait<Value>(
		input: Promise<Value> | (() => Promise<Value>),
	) {
	return waitResult(attemptAsync(input))
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
	const $wait = signal<Wait<Value, E>>(newWait<Value, E>())
	const $derived = derived(() => $wait()) as WaitSignal<Value, E>

	$derived.result = promise.then(async result => {
		const r: WaitDone<Value, E> = {done: true, ...result}
		await $wait(r)
		return r
	})

	$derived.ready = promise.then(result => getOk(result))

	return $derived
}

