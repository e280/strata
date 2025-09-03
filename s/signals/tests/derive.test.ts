
import {Science, test, expect, spy} from "@e280/science"
import {effect} from "../effect.js"
import {derive, signal} from "../fns.js"

export default Science.suite({
	"effect reacts to derived changes": test(async() => {
		const a = signal(1)
		const b = signal(10)
		const product = derive(() => a.value * b.value)

		let mutations = 0
		effect(() => {
			void product.get()
			mutations++
		})
		expect(product.value).is(10)
		expect(mutations).is(1)

		await a.set(2)
		expect(product.value).is(20)
		expect(mutations).is(2)

		await a.set(3)
		expect(product.value).is(30)
		expect(mutations).is(3)
	}),

	"effect doesn't overreact to derived": test(async() => {
		const a = signal(1)
		const b = signal(10)
		const product = signal.derive(() => a.value * b.value)

		const derivedSpy = spy(() => {})
		product.on(derivedSpy)

		let mutations = 0
		effect(() => {
			a.get()
			product.get()
			mutations++
		})
		expect(product.value).is(10)
		expect(mutations).is(1)
		expect(derivedSpy.spy.calls.length).is(0)

		await a.set(2)
		expect(product.value).is(20)
		expect(mutations).is(2)
		expect(derivedSpy.spy.calls.length).is(1)
	}),

	"derived.on": test(async() => {
		const a = signal(1)
		const b = signal(10)
		const product = signal.derive(() => a.value * b.value)
		expect(product.value).is(10)

		const mole = spy((_v: number) => {})
		product.on(mole)
		expect(mole.spy.calls.length).is(0)

		await a.set(2)
		expect(product.value).is(20)
		expect(mole.spy.calls.length).is(1)
		expect(mole.spy.calls[0].args[0]).is(20)
	}),

	"derived.on not called if result doesn't change": test(async() => {
		const a = signal(1)
		const b = signal(10)
		const product = signal.derive(() => a.value * b.value)
		expect(product.value).is(10)

		const mole = spy((_v: number) => {})
		product.on(mole)
		expect(mole.spy.calls.length).is(0)

		await a.set(2)
		expect(product.value).is(20)
		expect(mole.spy.calls.length).is(1)
		expect(mole.spy.calls[0].args[0]).is(20)

		await a.set(2)
		expect(product.value).is(20)
		expect(mole.spy.calls.length).is(1)
	}),
})

