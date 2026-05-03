
import {expect, science, test} from "@e280/science"
import {effect} from "./effect.js"
import {signal} from "./signal.js"
import {tracker} from "../tracker/tracker.js"

export default science.suite({
	"effect": test(async() => {
		const item = {}
		let calls = 0
		const stop = effect(() => tracker.read(item), () => calls++)
		expect(calls).is(0)

		tracker.write(item)
		expect(calls).is(1)

		stop()
		tracker.write(item)
		expect(calls).is(1)
	}),

	"signal read/write": test(async() => {
		const $count = signal(1)
		expect($count()).is(1)
		$count(2)
		expect($count()).is(2)
	}),

	"signal triggers effects": test(async() => {
		const $count = signal(1)
		let calls = 0
		effect(() => $count(), () => calls++)
		expect(calls).is(0)
		$count(2)
		expect(calls).is(1)
	}),

	"direct circularity forbidden": test(async() => {
		const $count = signal(1)
		effect(() => $count(), count => $count(count + 1))
		expect(() => $count(2)).throws()
	}),

	"indirect effect circular write is forbidden": test(async() => {
		const $alpha = signal(1)
		const $bravo = signal(1)
		let calls = 0

		effect(() => $alpha(), a => {
			calls++
			$bravo(a + 1)
		})

		effect(() => $bravo(), b => {
			calls++
			$alpha(b + 1)
		})

		expect(() => $alpha(2)).throws()
		expect(calls).is(2)
	}),
})

