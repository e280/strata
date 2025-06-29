
import {sub} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export type Signal<V> = {
	(): V
	(v: V): Promise<void>
	(v?: V): V | Promise<void>
} & PlainSignal<V>

export function signal<V>(v: V) {
	const signal = new PlainSignal<V>(v)

	function f(): V
	function f(v: V): Promise<void>
	function f(v?: V): V | Promise<void> {
		return (v !== undefined)
			? signal.set(v)
			: signal.value
	}

	Object.setPrototypeOf(f, PlainSignal.prototype)
	Object.assign(f, signal)

	return f as Signal<V>
}

export class PlainSignal<V> {
	on = sub<[V]>()
	published: Promise<V>

	constructor(public sneak: V) {
		this.published = Promise.resolve(sneak)
	}

	get value() {
		tracker.see(this)
		return this.sneak
	}

	set value(v: V) {
		this.set(v)
	}

	async set(v: V) {
		if (v !== this.sneak)
			await this.publish(v)
	}

	async publish(v = this.value) {
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

