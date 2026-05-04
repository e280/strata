
import {signal} from "../core/signal.js"
import {derived} from "../core/derived.js"
import {tracker} from "../tracker/tracker.js"

export function react(react: {
		useEffect: (fn: () => void | (() => void), deps?: unknown[]) => void
		useState: <X>(x: X | (() => X)) => [
			value: X,
			set: (value: X | ((x: X) => X)) => void
		]
	}) {

	const useTracker = <X>(fn: () => X) => {
		const [, setTick] = react.useState(0)
		const {seen, value} = tracker.observe(fn)

		react.useEffect(() => {
			const rerender = () => setTick(tick => tick + 1)
			const stoppers = [...seen].map(item => tracker.subscribe(item, rerender))
			return () => stoppers.forEach(stop => stop())
		})

		return value
	}

	const component = <P extends object, R>(render: (props: P) => R) => {
		const c = (props: P) => useTracker(() => render(props))
		c.displayName = (render as any).displayName ?? render.name ?? "Component"
		return c
	}

	const useOnce = <X>(fn: () => X) => {
		const [value] = react.useState(fn)
		return value
	}

	const useSignal = <X>(value: X) => {
		const $signal = useOnce(() => signal(value))
		void useTracker(() => $signal())
		return $signal
	}

	const useDerived = <X>(formula: () => X) => {
		const $derived = useOnce(() => derived(formula))
		void useTracker(() => $derived())
		return $derived
	}

	return {component, useTracker, useOnce, useSignal, useDerived}
}

