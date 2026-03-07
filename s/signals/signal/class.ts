
import {Sub} from "@e280/stz"
import {signal} from "./fn.js"
import {SignalOptions} from "../types.js"
import {tracker} from "../../tracker/tracker.js"
import {_compare, _lock} from "../utils/symbols.js"

export interface Signal<Value> {
	(): Value
	(value: Value): Promise<Value>
}

export class Signal<Value> {
	sneak!: Value
	on!: Sub<[Value]>

	;[_lock]!: boolean
	;[_compare]!: (a: any, b: any) => boolean

	constructor(value: Value, options?: Partial<SignalOptions>) {
		if (new.target !== Signal) throw new Error("Signal cannot be subclassed")
		return signal(value, options)
	}

	get value() {
		return (this as Signal<any>).get()
	}

	set value(value: any) {
		void (this as Signal<any>).set(value)
	}

	get() {
		tracker.notifyRead(this)
		return this.sneak
	}

	async set(value: Value, forcePublish = false) {
		const previous = this.sneak
		this.sneak = value
		if (forcePublish || !this[_compare](previous, value))
			await this.publish()
		return value
	}

	async publish(): Promise<Value> {
		// only wizards are allowed beyond this point.
		// - the implementation is subtle
		// - it looks wrong, but it's right
		// - tarnished alchemists, take heed: lock engages only for sync activity of the async fns (think of the value setter!)

		if (this[_lock])
			throw new Error("forbid circularity")

		const value = this.sneak
		let promise: Promise<any> = Promise.resolve()

		try {
			this[_lock] = true
			promise = Promise.all([
				tracker.notifyWrite(this),
				this.on.pub(value),
			])
		}
		finally {
			this[_lock] = false
		}

		await promise
		return value
	}

	toString() {
		return `($signal "${String(this.get())}")`
	}
}

