
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
		const stop = effect(() => {
			tracker.read(item)
			calls++
		})
		expect(calls).is(1)

		tracker.write(item)
		expect(calls).is(2)

		stop()
		tracker.write(item)
		expect(calls).is(2)
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
		effect(() => {
			$count()
			calls++
		})
		expect(calls).is(1)
		$count(2)
		expect(calls).is(2)
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

	"derived more": test(async() => {
		const $alpha = signal(2)
		const $bravo = signal(10)
		const $derived = derived(() => $alpha() * $bravo())
		expect($derived()).is(20)
		$alpha(3)
		expect($derived()).is(30)
		$alpha(4)
		expect($derived()).is(40)
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
		effect(() => {
			$derived()
			effectCalls++
		})
		expect(derivedCalls).is(1)
		expect(effectCalls).is(1)
		$alpha(3)
		expect(derivedCalls).is(2)
		expect(effectCalls).is(2)
	}),

	"derived tracks dynamic dependencies": test(async() => {
		const $useAlpha = signal(true)
		const $alpha = signal(2)
		const $bravo = signal(10)
		let calls = 0

		const $derived = derived(() => {
			calls++
			return $useAlpha()
				? $alpha()
				: $bravo()
		})

		expect($derived()).is(2)
		expect(calls).is(1)

		$bravo(11)
		expect($derived()).is(2)
		expect(calls).is(1)

		$useAlpha(false)
		expect($derived()).is(11)
		expect(calls).is(2)

		$alpha(3)
		expect($derived()).is(11)
		expect(calls).is(2)

		$bravo(12)
		expect($derived()).is(12)
		expect(calls).is(3)
	}),

	"derived remains subscribed after a thrown recompute": test(async() => {
		const $throws = signal(false)
		const $count = signal(1)
		const values: (number | "err")[] = []

		const $derived = derived(() => {
			if ($throws())
				throw new Error("boom")
			return $count() * 2
		})

		effect(() => {
			try {
				values.push($derived())
			}
			catch {
				values.push("err")
			}
		})

		expect(values.join(",")).is("2")

		$throws(true)
		expect(values.join(",")).is("2,err")

		$throws(false)
		expect(values.join(",")).is("2,err,2")

		$count(3)
		expect(values.join(",")).is("2,err,2,6")
	}),

	"derived circular reads throw": test(async() => {
		let $derived!: () => number
		$derived = derived(() => $derived() + 1)

		expect(() => $derived()).throws()
	}),

	"batching signal effects seems to work": test(async() => {
		const $alpha = signal(2)
		const $bravo = signal(10)
		let calls: number[] = []
		effect(() => calls.push($alpha() * $bravo()))
		calls = []
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

	"evil circularity is no problem": test(async() => {
		const $alpha = signal(1)
		let count = 0
		effect(() => {
			count++
			if (count < 10)
				$alpha($alpha() + 1)
		})
		expect(count).lt(5)
	}),

	"sneaky evil circularity is no problem": test(async() => {
		const $alpha = signal(1)
		const $bravo = signal(1)

		let countAlpha = 0
		effect(() => {
			countAlpha++
			if (countAlpha < 10)
				$alpha($bravo() + 1)
		})

		let countBravo = 0
		effect(() => {
			countBravo++
			if (countBravo < 10)
				$bravo($alpha() + 1)
		})

		$alpha(99)
		$bravo(99)
		expect(countAlpha).lt(5)
		expect(countBravo).lt(5)
	}),

	"effect writes are self-damped": test(async() => {
		const $count = signal(1)
		let calls = 0

		effect(() => {
			calls++
			if (calls < 10)
				$count($count() + 1)
		})

		expect(calls).is(1)
		expect($count()).is(2)
	}),
})
