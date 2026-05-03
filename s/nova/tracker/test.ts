
import {Tracker} from "../tracker.js"
import {science, test, expect} from "@e280/science"

export default science.suite({
	"subscriptions": test(async() => {
		const tracker = new Tracker()
		let alpha = 0
		let bravo = 0
		const item = {}
		const alphaOff = tracker.subscribe(item, () => alpha++)
		tracker.subscribe(item, () => bravo++)

		tracker.write(item)
		expect(alpha).is(1)
		expect(bravo).is(1)

		tracker.write(item)
		expect(alpha).is(2)
		expect(bravo).is(2)

		alphaOff()
		tracker.write(item)
		expect(alpha).is(2)
		expect(bravo).is(3)
	}),

	"observe": test(async() => {
		const tracker = new Tracker()
		const item = {}

		const {seen, ret} = tracker.observe(() => {
			tracker.read(item)
			return 123
		})

		expect(seen.has(item)).is(true)
		expect(ret).is(123)
	}),

	"nested observe layers are isolated": test(async() => {
		const tracker = new Tracker()
		const outer = {}
		const inner = {}

		const observed = tracker.observe(() => {
			tracker.read(outer)

			const nested = tracker.observe(() => {
				tracker.read(inner)
			})

			expect(nested.seen.has(inner)).is(true)
			expect(nested.seen.has(outer)).is(false)
		})

		expect(observed.seen.has(outer)).is(true)
		expect(observed.seen.has(inner)).is(false)
	}),

	"batch dedupes subscriber calls": test(async() => {
		const tracker = new Tracker()
		let called = 0
		const item = {}

		tracker.subscribe(item, () => called++)

		tracker.batch(() => {
			tracker.write(item)
			tracker.write(item)
			tracker.write(item)
		})

		expect(called).is(1)
	}),

	"nested batch flushes only once": test(async() => {
		const tracker = new Tracker()
		let called = 0
		const item = {}

		tracker.subscribe(item, () => called++)

		tracker.batch(() => {
			tracker.write(item)

			tracker.batch(() => {
				tracker.write(item)
				expect(called).is(0)
			})

			expect(called).is(0)
		})

		expect(called).is(1)
	}),

	"batch flushes cascading writes in waves": test(async() => {
		const tracker = new Tracker()
		const a = {}
		const b = {}
		const calls: string[] = []

		tracker.subscribe(a, () => {
			calls.push("a")
			tracker.write(b)
		})

		tracker.subscribe(b, () => {
			calls.push("b")
		})

		tracker.batch(() => {
			tracker.write(a)
		})

		expect(calls.join(",")).is("a,b")
	}),

	"circularity is forbidden": test(async() => {
		const tracker = new Tracker()
		const item = {}

		const fn = () => tracker.write(item)
		tracker.subscribe(item, fn)

		expect(() => tracker.write(item)).throws()
	}),
})
