
import {sub} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export function signal<V>(value: V) {
	return new Signal<V>(value)
}

export class Signal<V> {
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

