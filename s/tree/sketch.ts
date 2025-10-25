
import {deep, Sub, sub} from "@e280/stz"
import {tracker} from "../tracker/tracker.js"
import {Immutable, Mutator, Selector, TreeOptions} from "./parts/types.js"

export const _data = Symbol("data")

export type Treeoid<D extends {}> = {
	[_data]: D
	get state(): Immutable<D>
	on: Sub<[state: Immutable<D>]>
	mutate(mutator: Mutator<D>): Promise<Immutable<D>>
	// branch<Sub extends {}>(selector: Selector<Sub, S>): Branch<Sub, S>
}

export class Tree<D extends {}> implements Treeoid<D> {
	;[_data]: D
	#rootBranch: Branch<D, D>

	on = sub<[state: Immutable<D>]>()

	constructor(data: D, private options: TreeOptions) {
		this[_data] = data
		this.#rootBranch = new Branch(this, s => s, options)
		this.on(() => this.#rootBranch.refresh())
	}

	get state() {
		return this.#rootBranch.state
	}

	async mutate(mutator: Mutator<D>) {
		const oldData = this[_data]
		const newData = this.options.clone(this[_data])
		mutator(newData)
		const isChanged = !deep.equal(newData, oldData)
		if (isChanged) {
			this[_data] = newData
			await this.on.publish(this.state)
		}
		return this.state
	}
}

export class Branch<D extends {}, ParentData extends {}> implements Treeoid<D> {
	;[_data]: D
	#state: Immutable<D>

	on = sub<[state: Immutable<D>]>()

	constructor(
			private parent: Treeoid<ParentData>,
			private selector: Selector<D, ParentData>,
			private options: TreeOptions,
		) {
		this[_data] = selector(parent[_data])
		this.#state = this.#petrify(this[_data])
	}

	#petrify<X>(x: X) {
		return deep.freeze(this.options.clone(x)) as Immutable<X>
	}

	get state() {
		tracker.notifyRead(this)
		return this.#state
	}

	async mutate(mutator: Mutator<D>) {
		await this.parent.mutate(parentData => mutator(this.selector(parentData)))
		return this.state
	}

	async refresh() {
		const oldData = this[_data]
		const newData = this.selector(this.parent[_data])
		const isChanged = !deep.equal(newData, oldData)
		if (isChanged) {
			this[_data] = newData
			this.#state = this.#petrify(newData)
			await this.on.publish(this.state)
			await tracker.notifyWrite(this)
		}
	}
}

