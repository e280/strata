
import {sub} from "@e280/stz"
import {collectorEffect} from "./effect.js"
import {tracker} from "../../tracker/tracker.js"

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

export class LazyCore<V> extends ReadableSignal<V> {
	kind: "lazy" = "lazy"

	_dirty = false
	_effect: (() => void) | undefined

	constructor(public _formula: () => V) {
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
			if (v !== this.sneak) {
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
	static make<V>(that: DerivedCore<V>, formula: () => V) {
		const {result, dispose} = collectorEffect(formula, async() => {
			const value = formula()
			that.sneak = value
			await Promise.all([
				tracker.change(that),
				that.on.pub(value),
			])
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

