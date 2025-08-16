
import {sub} from "@e280/stz"
import {SignalOptions} from "./types.js"
import {collectorEffect} from "./effect.js"
import {tracker} from "../../tracker/tracker.js"

const defaultSignalOptions: SignalOptions = {
	compare: (a, b) => a === b
}

export function processSignalOptions(options: Partial<SignalOptions> = {}) {
	return {...defaultSignalOptions, ...options}
}

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
	_lock = false

	constructor(sneak: V, public _options: SignalOptions) {
		super(sneak)
	}

	async set(v: V) {
		const isChanged = !this._options.compare(this.sneak, v)
		if (isChanged)
			await this.publish(v)
		return v
	}

	get value() {
		return this.get()
	}

	set value(v: V) {
		this.set(v)
	}

	async publish(v = this.get()) {
		if (this._lock)
			throw new Error("forbid circularity")

		let promise = Promise.resolve()

		try {
			this._lock = true
			this.sneak = v
			promise = Promise.all([
				tracker.change(this),
				this.on.pub(v),
			]) as any
		}
		finally {
			this._lock = false
		}

		await promise
		return v
	}
}

export class LazyCore<V> extends ReadableSignal<V> {
	kind: "lazy" = "lazy"

	_dirty = false
	_effect: (() => void) | undefined

	constructor(public _formula: () => V, public _options: SignalOptions) {
		super(undefined as any)
	}

	get() {
		if (!this._effect) {
			const {result, dispose} = collectorEffect(this._formula, () => this._dirty = true)
			this._effect = dispose
			this.sneak = result
		}
		if (this._dirty) {
			this._dirty = false

			const v = this._formula()
			const isChanged = !this._options.compare(this.sneak, v)
			if (isChanged) {
				this.sneak = v
				tracker.change(this)
			}
		}
		return super.get()
	}

	get value() {
		return this.get()
	}

	dispose() {
		if (this._effect)
			this._effect()
	}
}

export class DerivedCore<V> extends ReactiveSignal<V> {
	static make<V>(that: DerivedCore<V>, formula: () => V, options: SignalOptions) {
		const {result, dispose} = collectorEffect(formula, async() => {
			const value = formula()
			const isChanged = !options.compare(that.sneak, value)
			if (isChanged) {
				that.sneak = value
				await Promise.all([
					tracker.change(that),
					that.on.pub(value),
				])
			}
		})
		return new this(result, dispose)
	}

	kind: "derived" = "derived"

	constructor(initialValue: V, public _effect: () => void) {
		super(initialValue)
	}

	get value() {
		return this.get()
	}

	dispose() {
		super.dispose()
		this._effect()
	}
}

