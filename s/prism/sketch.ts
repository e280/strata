
import {deep, sub} from "@e280/stz"
import {Immutable} from "./types.js"
import {tracker} from "../tracker/tracker.js"

function immute<S>(s: S) {
	return deep.freeze(deep.clone(s)) as Immutable<S>
}

export type Adapter<State> = {
	getMutable: () => State
	getImmutable: () => Immutable<State>
	mutate: <R>(fn: (state: State) => R) => Promise<R>
}

export class Prism<State> {
	#mutable: State
	#immutable: Immutable<State>
	#lenses = new Set<Lens<any>>()

	constructor(state: State) {
		this.#mutable = state
		this.#immutable = immute(state)
	}

	async overwrite(state: State) {
		this.#mutable = state
		this.#immutable = immute(state)
		await Promise.all([...this.#lenses].map(lens => lens.update()))
	}

	lens<State2>(selector: (state: State) => State2) {
		const lens = new Lens<State2>({
			getMutable: () => selector(this.#mutable),
			getImmutable: () => selector(this.#immutable as State) as Immutable<State2>,
			mutate: async fn => {
				const result = fn(selector(this.#mutable))
				await this.overwrite(this.#mutable)
				return result
			},
		})
		this.#lenses.add(lens)
		return lens
	}
}

export class Lens<State> {
	on = sub<[state: Immutable<State>]>()
	#previous: State

	constructor(private adapter: Adapter<State>) {
		this.#previous = deep.clone(adapter.getMutable())
	}

	async update() {
		const isChanged = !deep.equal(this.adapter.getMutable(), this.#previous)
		if (isChanged) {
			this.on.publish(this.state)
			await tracker.notifyWrite(this)
		}
	}

	get state() {
		tracker.notifyRead(this)
		return this.adapter.getImmutable()
	}

	async mutate<R>(fn: (state: State) => R) {
		return this.adapter.mutate(fn)
	}

	lens<State2>(selector: (state: State) => State2) {
		return new Lens<State2>({
			getMutable: () => selector(this.adapter.getMutable()),
			getImmutable: () => selector(this.adapter.getImmutable() as State) as Immutable<State2>,
			mutate: fn => this.adapter.mutate(state => fn(selector(state))),
		})
	}
}

