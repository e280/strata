
import {tracker} from "../tracker.js"
import {signal} from "../../signals/signal/fn.js"
import {derived} from "../../signals/derived/fn.js"
import {SignalOptions} from "../../signals/types.js"

export function react(react: {
		useEffect: (fn: () => void | (() => void), deps?: unknown[]) => void
		useState: <X>(x: X | (() => X)) => [
			value: X,
			set: (value: X | ((x: X) => X)) => void
		]
	}) {

	const useStrata = <X>(fn: () => X) => {
		const [, setTick] = react.useState(0)
		const {seen, result} = tracker.observe(fn)

		react.useEffect(() => {
			const rerender = async() => setTick(tick => tick + 1)
			const stoppers = [...seen].map(item => tracker.subscribe(item, rerender))
			return () => stoppers.forEach(stop => stop())
		})

		return result
	}

	const component = <P extends object, R>(render: (props: P) => R) => {
		const c = (props: P) => useStrata(() => render(props))
		c.displayName = (render as any).displayName ?? render.name ?? "Component"
		return c
	}

	const useOnce = <X>(fn: () => X) => {
		const [value] = react.useState(fn)
		return value
	}

	const useSignal = <X>(value: X, options?: Partial<SignalOptions>) => {
		const $signal = useOnce(() => signal(value, options))
		void useStrata(() => $signal())
		return $signal
	}

	const useDerived = <X>(formula: () => X, options?: Partial<SignalOptions>) => {
		const $derived = useOnce(() => derived(formula, options))
		void useStrata(() => $derived())
		return $derived
	}

	return {component, useStrata, useOnce, useSignal, useDerived}
}

