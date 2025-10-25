
import {deep, microbounce, sub} from "@e280/stz"

import {_data, _onChange} from "./symbols.js"
import {Branch} from "./branch.js"
import {processOptions} from "./process-options.js"
import {Mutator, TreeLike, TreeOptions, TreeData, Selector, BranchData, Immutable} from "./types.js"

export class Tree<D extends TreeData> implements TreeLike<D> {
	;[_data]: D
	;[_onChange] = sub()

	#rootBranch: Branch<D, D>
	#mutationLock = 0

	options: TreeOptions
	on = sub<[state: Immutable<D>]>()
	#debouncedPublish = microbounce(() => this.on.publish(this.state))

	constructor(data: D, options?: TreeOptions) {
		this.options = processOptions(options)
		this[_data] = data
		this.#rootBranch = new Branch(this, s => s, this.options)
	}

	get state() {
		return this.#rootBranch.state
	}

	async mutate(mutator: Mutator<D>) {
		if (this.#mutationLock !== 0)
			throw new Error("nested mutations are forbidden")

		this.#mutationLock++
		let promise: Promise<any> = Promise.resolve()

		try {
			const oldData = this[_data]
			const newData = this.options.clone(this[_data])
			mutator(newData)
			const isChanged = !deep.equal(newData, oldData)
			if (isChanged) {
				this[_data] = newData
				promise = Promise.all([
					this[_onChange].publish(),
					this.#debouncedPublish(),
				])
			}
		}
		finally {
			this.#mutationLock--
		}

		await promise
		return this.state
	}

	branch<D2 extends BranchData>(selector: Selector<D2, D>): Branch<D2, D> {
		return new Branch(this, selector, this.options)
	}
}

