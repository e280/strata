
import {deep, disposer, microbounce, sub} from "@e280/stz"

import {_data, _onChange} from "./symbols.js"
import {tracker} from "../tracker/tracker.js"
import {BranchData, Immutable, Mutator, Selector, TreeLike, TreeOptions} from "./types.js"

export class Branch<D extends BranchData, ParentData extends BranchData> implements TreeLike<D> {
	;[_data]: D
	;[_onChange] = sub()
	#state: Immutable<D>

	dispose = disposer()
	on = sub<[state: Immutable<D>]>()
	#debouncedPublish = microbounce(() => this.on.publish(this.state))

	constructor(
			private parent: TreeLike<ParentData>,
			private selector: Selector<D, ParentData>,
			private options: TreeOptions,
		) {
		this[_data] = selector(parent[_data])
		this.#state = this.#petrify(this[_data])
		this.dispose.schedule(parent[_onChange](() => this.refresh()))
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
			await Promise.all([
				this[_onChange].publish(),
				this.#debouncedPublish(),
				tracker.notifyWrite(this),
			])
		}
	}

	branch<D2 extends BranchData>(selector: Selector<D2, D>): Branch<D2, D> {
		return new Branch(this, selector, this.options)
	}
}

