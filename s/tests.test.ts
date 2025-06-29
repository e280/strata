
import {expect, Science, test} from "@e280/science"

import tree from "./tree/tree.test.js"
import signals from "./signals/signals.test.js"

import {Trunk} from "./tree/parts/trunk.js"
import {effect} from "./signals/parts/effect.js"
import {signal} from "./signals/parts/signal.js"

await Science.run({
	tree,
	signals,

	interop: Science.suite({

		// NOTE: this test passes
		"effect responds to trunk change": test(async() => {
			const trunk = new Trunk({count: 1})

			let copy = 0
			expect(copy).is(0)

			const e = effect(() => copy = trunk.state.count)
			expect(copy).is(1)

			await trunk.mutate(s => s.count++)
			await e.wait // TODO eliminate the need for this?
			expect(copy).is(2)
		}),

		// NOTE: this test FAILS
		"branch can include signal value": test(async() => {
			const bingus = signal(101)
			const trunk = new Trunk({count: 1})
			const branch = trunk.branch(s => ({
				count: s.count,
				bingus: bingus.value,
			}))
			expect(branch.state.count).is(1)
			expect(branch.state.bingus).is(101)

			bingus.value++
			// TODO no way to wait for this??
			expect(branch.state.count).is(1)
			expect(branch.state.bingus).is(102)
		}),
	}),
})

