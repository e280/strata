
import {expect, Science, test} from "@e280/science"

import tree from "./tree/tree.test.js"
import signals from "./signals/signals.test.js"
import signals2 from "./signals2/signals.test.js"
import tracker from "./tracker/tracker.test.js"

import {Trunk} from "./tree/parts/trunk.js"
import {effect} from "./signals/effect.js"
import {signal} from "./signals/signal.js"

await Science.run({
	tree,
	signals,
	signals2,
	tracker,

	interop: Science.suite({
		"effect responds to trunk change": test(async() => {
			const trunk = new Trunk({count: 1})

			let copy = 0
			expect(copy).is(0)

			effect(() => copy = trunk.state.count)
			expect(copy).is(1)

			await trunk.mutate(s => s.count++)
			expect(copy).is(2)
		}),

		"signal.set participates in flush": test(async() => {
			let order: string[] = []
			const count = signal(0)

			effect(() => {
				if (count.value)
					order.push("effect")
			})

			order.push("before")
			await count.set(1)
			order.push("after")

			expect(order.length).is(3)
			expect(order[0]).is("before")
			expect(order[1]).is("effect")
			expect(order[2]).is("after")
		}),

		"branch can include signal value": test(async() => {
			const bingus = signal(101)
			const trunk = new Trunk({count: 1})
			const branch = trunk.branch(s => ({
				count: s.count,
				bingus: bingus.value,
			}))
			expect(branch.state.count).is(1)
			expect(branch.state.bingus).is(101)

			await bingus.set(102)
			expect(branch.state.count).is(1)
			expect(branch.state.bingus).is(102)
		}),
	}),
})

