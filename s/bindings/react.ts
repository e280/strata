
import {signal} from "../signals/signal.js"
import {tracker} from "../tracker/global.js"
import {derived} from "../signals/derived.js"

export function reactBindings(react: {
		useEffect: (fn: () => void | (() => void), deps?: unknown[]) => void
		useState: <X>(x: X | (() => X)) => [
			value: X,
			set: (value: X | ((x: X) => X)) => void
		]
	}) {

	const useTracked = <X>(fn: () => X) => {
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
		const c = (props: P) => useTracked(() => render(props))
		c.displayName = (render as any).displayName ?? render.name ?? "Component"
		return c
	}

	const useOnce = <X>(fn: () => X) => {
		const [value] = react.useState(fn)
		return value
	}

	const useSignal = <X>(value: X) => {
		const $signal = useOnce(() => signal(value))
		void useTracked(() => $signal())
		return $signal
	}

	const useDerived = <X>(formula: () => X) => {
		const $derived = useOnce(() => derived(formula))
		void useTracked(() => $derived())
		return $derived
	}

	return {component, useTracked, useOnce, useSignal, useDerived}
}

