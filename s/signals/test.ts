
import {expect, science, test} from "@e280/science"
import {batch} from "./batch.js"
import {effect} from "./effect.js"
import {signal} from "./signal.js"
import {derived} from "./derived.js"
import {tracker} from "../tracker/global.js"

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

	"shorthand effect syntax": test(async() => {
		const $alpha = signal(2)
		const $bravo = signal(10)
		const calls: number[] = []
		effect(() => calls.push($alpha() * $bravo()))
		expect(calls.length).is(1)
		$alpha(3)
		expect(calls.length).is(2)
		expect(calls.at(-1)!).is(30)
	}),

	"derived": test(async() => {
		const $alpha = signal(2)
		const $bravo = signal(10)
		const $derived = derived(() => $alpha() * $bravo())
		expect($derived()).is(20)
		$alpha(3)
		expect($derived()).is(30)
	}),

	"derived is lazy": test(async() => {
		const $alpha = signal(2)
		const $bravo = signal(10)
		let calls = 0
		const $derived = derived(() => {
			calls++
			return $alpha() * $bravo()
		})
		expect(calls).is(0)
		expect($derived()).is(20)
		expect(calls).is(1)
		expect($derived()).is(20)
		expect(calls).is(1)
		$alpha(3)
		$alpha(4)
		expect(calls).is(1)
		expect($derived()).is(40)
		expect(calls).is(2)
	}),

	"derived triggers effects": test(async() => {
		const $alpha = signal(2)
		const $bravo = signal(10)
		let derivedCalls = 0
		let effectCalls = 0
		const $derived = derived(() => {
			derivedCalls++
			return $alpha() * $bravo()
		})
		effect(() => $derived(), () => effectCalls++)
		expect(derivedCalls).is(1)
		expect(effectCalls).is(0)
		$alpha(3)
		expect(derivedCalls).is(2)
		expect(effectCalls).is(1)
	}),

	"batching signal effects seems to work": test(async() => {
		const $alpha = signal(2)
		const $bravo = signal(10)
		let calls: number[] = []
		effect(() => $alpha() * $bravo(), value => calls.push(value))
		batch(() => {
			$alpha(3)
			$alpha(4)
			$alpha(5)
			$bravo(1)
			$bravo(11)
		})
		expect(calls.length).is(1)
		expect(calls[0]).is(55)
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

