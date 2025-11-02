
import {deep, sub} from "@e280/stz"
import {Immutable} from "./types.js"
import {tracker} from "../tracker/tracker.js"

function immute<S>(s: S) {
	return deep.freeze(deep.clone(s)) as Immutable<S>
}

export type Optic<State> = {
	getState: () => State
	mutate: <R>(fn: (state: State) => R) => Promise<R>
}

export class Prism<State> {
	#state: State
	#lenses = new Set<Lens<any>>()

	constructor(state: State) {
		this.#state = state
	}

	async overwrite(state: State) {
		this.#state = state
		await Promise.all([...this.#lenses].map(lens => lens.update()))
	}

	lens<State2>(selector: (state: State) => State2) {
		const lens = new Lens<State2>({
			getState: () => selector(this.#state),
			mutate: async fn => {
				const result = fn(selector(this.#state))
				await this.overwrite(this.#state)
				return result
			},
		})
		this.#lenses.add(lens)
		return lens
	}
}

export class CacheBox<R> {
	#dirty = false
	#value: R

	constructor(private calculate: () => R) {
		this.#value = calculate()
	}

	get() {
		if (this.#dirty) {
			this.#dirty = false
			this.#value = this.calculate()
		}
		return this.#value
	}

	markDirty() {
		this.#dirty = true
	}
}

export class Lens<State> {
	on = sub<[state: Immutable<State>]>()
	#previous: State
	#immutable: CacheBox<Immutable<State>>

	constructor(private optic: Optic<State>) {
		this.#previous = deep.clone(optic.getState())
		this.#immutable = new CacheBox(() => immute(optic.getState()))
	}

	async update() {
		const state = this.optic.getState()
		const isChanged = !deep.equal(state, this.#previous)
		if (isChanged) {
			this.#previous = deep.clone(state)
			this.on.publish(this.state)
			this.#immutable.markDirty()
			await tracker.notifyWrite(this)
		}
	}

	get state() {
		tracker.notifyRead(this)
		return this.#immutable.get()
	}

	async mutate<R>(fn: (state: State) => R) {
		return this.optic.mutate(fn)
	}

	lens<State2>(selector: (state: State) => State2) {
		return new Lens<State2>({
			getState: () => selector(this.optic.getState()),
			mutate: fn => this.optic.mutate(state => fn(selector(state))),
		})
	}
}

