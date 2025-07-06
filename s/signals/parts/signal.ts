
import {Sub, sub} from "@e280/stz"

// import {lazy} from "./lazy.js"
// import {derive} from "./derive.js"
import {tracker} from "../../tracker/tracker.js"

export type Signal<V> = {
	(): V
	(v: V): Promise<void>
	(v?: V): V | Promise<void>

	kind: "signal"

	sneak: V
	value: V
	on: Sub<[V]>
	get(): V
	set(v: V): Promise<void>
	publish(v?: V): Promise<void>
	dispose(): void
} & SignalCore<V>

export function signal<V>(value: V) {
	function fn(): V
	function fn(v: V): Promise<void>
	function fn(v?: V): V | Promise<void> {
		return v !== undefined
			? (fn as any).set(v)
			: (fn as any).get()
	}

	const core = new SignalCore(value)
	Object.setPrototypeOf(fn, SignalCore.prototype)
	Object.assign(fn, core)

	return fn as Signal<V>
}

// signal.lazy = lazy
// signal.derive = derive

export class ReadableSignal<V> {
	constructor(public sneak: V) {}

	get() {
		tracker.see(this)
		return this.sneak
	}

	get value() {
		return this.get()
	}
}

export class ReactiveSignal<V> extends ReadableSignal<V> {
	on = sub<[V]>()

	dispose() {
		this.on.clear()
	}
}

export class SignalCore<V> extends ReactiveSignal<V> {
	kind: "signal" = "signal"

	constructor(sneak: V) {
		super(sneak)
	}

	async set(v: V) {
		if (v !== this.sneak)
			await this.publish(v)
	}

	get value() {
		return this.get()
	}

	set value(v: V) {
		this.set(v)
	}

	async publish(v = this.get()) {
		this.sneak = v
		await Promise.all([
			tracker.change(this),
			this.on.pub(v),
		])
	}
}


