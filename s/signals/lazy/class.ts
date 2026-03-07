
import {lazy} from "./fn.js"
import {SignalOptions} from "../types.js"
import {tracker} from "../../tracker/tracker.js"
import {_collect, _compare, _dirty, _disposers, _effect, _formula} from "../utils/symbols.js"

export interface Lazy<Value> {
	(): Value
}

export class Lazy<Value> {
	sneak!: Value
	;[_formula]!: () => Value
	;[_dirty]!: boolean
	;[_disposers]!: (() => void)[]
	;[_effect]!: (() => void) | undefined
	;[_compare]!: (a: any, b: any) => boolean

	constructor(formula: () => Value, options?: Partial<SignalOptions>) {
		if (new.target !== Lazy) throw new Error("Lazy cannot be subclassed")
		return lazy(formula, options)
	}

	get value() {
		return this.get()
	}

	[_collect]() {
		for (const d of this[_disposers]) d()
		this[_disposers] = []

		const {seen, result} = tracker.observe(this[_formula])

		const markDirty = async() => { this[_dirty] = true }
		for (const saw of seen)
			this[_disposers].push(tracker.subscribe(saw, markDirty))

		this[_effect] = () => {
			for (const d of this[_disposers]) d()
			this[_disposers] = []
		}

		return result
	}

	get() {
		if (!this[_effect]) {
			this.sneak = this[_collect]()
			this[_dirty] = false
		}
		else if (this[_dirty]) {
			this[_dirty] = false
			const value = this[_collect]()
			const isChanged = !this[_compare](this.sneak, value)
			if (isChanged) {
				this.sneak = value
				tracker.notifyWrite(this)
			}
		}

		tracker.notifyRead(this)
		return this.sneak
	}

	dispose() {
		if (this[_effect])
			this[_effect]()
	}

	toString() {
		return `($lazy "${String(this.get())}")`
	}
}

