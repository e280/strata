
import {Science, test, expect} from "@e280/science"
import {Tracker} from "./tracker.js"

export default Science.suite({
	"change waits for downstream effects to settle": test(async() => {
		const tracker = new Tracker()
		let order: string[] = []

		const item = {}
		tracker.changed(item, async () => {
			await Promise.resolve()
			order.push("effect")
		})

		order.push("before")
		await tracker.change(item)
		order.push("after")

		expect(order.length).is(3)
		expect(order[0]).is("before")
		expect(order[1]).is("effect")
		expect(order[2]).is("after")
	}),

	"circularity forbidden": test(async() => {
		const tracker = new Tracker()
		const item = {}

		// effect re-publishes the same change, creating a cycle
		tracker.changed(item, async() => {
			await tracker.change(item)
		})

		expect(async() => {
			await tracker.change(item)
		}).throwsAsync()
	}),
})

