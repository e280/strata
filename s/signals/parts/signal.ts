
import {sub} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export type Signal<V> = {
	(): V
	(v: V): Promise<void>
	(v?: V): V | Promise<void>
} & SignalCore<V>

export function signal<V>(value: V) {
	const core = new SignalCore(value)

	function fn(): V
	function fn(v: V): Promise<void>
	function fn(v?: V): V | Promise<void> {
		return v !== undefined
			? (fn as any).set(v)
			: (fn as any).get()
	}

	Object.setPrototypeOf(fn, SignalCore.prototype)
	Object.assign(fn, core)

	return fn as Signal<V>
}

export class SignalCore<V> {
	on = sub<[V]>()
	published: Promise<V>

	constructor(public sneak: V) {
		this.published = Promise.resolve(sneak)
	}

	get() {
		tracker.see(this)
		return this.sneak
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
			this.published = this.on.pub(v).then(() => v),
		])
	}

	dispose() {
		this.on.clear()
	}
}

