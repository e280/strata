
import {getErr, getOk, gotOk, gotErr} from "@e280/stz"
import {WaitState} from "./type.js"

export function waitGet<Value>(wait: WaitState<Value>) {
	return wait.done
		? getOk(wait)
		: undefined
}

export function waitGot<Value>(wait: WaitState<Value>) {
	if (!wait.done) throw new Error("wait not done")
	return gotOk(wait)
}

export function waitGetErr<E = unknown>(wait: WaitState<unknown, E>) {
	return wait.done
		? getErr(wait)
		: undefined
}

export function waitGotErr<E = unknown>(wait: WaitState<unknown, E>) {
	if (!wait.done) throw new Error("wait not done")
	return gotErr(wait)
}

/** @deprecated renamed to `waitGet` */
export const waitGetOk = waitGet

/** @deprecated renamed to `waitGot` */
export const waitNeedOk = waitGot

/** @deprecated renamed to `waitGotErr` */
export const waitNeedErr = waitGotErr

