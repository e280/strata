
import {getErr, getOk, gotOk, gotErr} from "@e280/stz"
import {Wait} from "./type.js"

export function waitGet<Value>(wait: Wait<Value>) {
	return wait.done
		? getOk(wait)
		: undefined
}

export function waitGot<Value>(wait: Wait<Value>) {
	if (!wait.done) throw new Error("wait not done")
	return gotOk(wait)
}

export function waitGetErr<E = unknown>(wait: Wait<unknown, E>) {
	return wait.done
		? getErr(wait)
		: undefined
}

export function waitGotErr<E = unknown>(wait: Wait<unknown, E>) {
	if (!wait.done) throw new Error("wait not done")
	return gotErr(wait)
}

/** @deprecated renamed to `waitGet` */
export const waitGetOk = waitGet

/** @deprecated renamed to `waitGot` */
export const waitNeedOk = waitGot

/** @deprecated renamed to `waitGotErr` */
export const waitNeedErr = waitGotErr

