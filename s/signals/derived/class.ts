
import {Sub} from "@e280/stz"
import {derived} from "./fn.js"
import {SignalOptions} from "../types.js"
import {tracker} from "../../tracker/tracker.js"

export interface Derived<Value> {
	(): Value
}

export class Derived<Value> {
	sneak!: Value
	on!: Sub<[Value]>
	dispose!: () => void

	constructor(formula: () => Value, options?: Partial<SignalOptions>) {
		if (new.target !== Derived) throw new Error("Derived cannot be subclassed")
		return derived(formula, options)
	}

	get value() {
		return (this as Derived<any>).get()
	}

	get() {
		tracker.notifyRead(this)
		return this.sneak
	}

	toString() {
		return `(derived "${String(this.get())}")`
	}
}

