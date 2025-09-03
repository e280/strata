
import {Signal} from "../signal.js"
import {SignalFn} from "../types.js"

export function hipster<V>(sig: Signal<V>) {
	function f(): V
	function f(v: V): Promise<V>
	function f(_v?: V): V | Promise<V> {
		return (arguments.length === 0)
			? sig.get()
			: sig.set(arguments[0])
	}

	f.on = sig.on
	f.set = sig.set.bind(sig)
	f.publish = sig.publish.bind(sig)
	f.dispose = sig.dispose.bind(sig)

	Object.setPrototypeOf(f, {
		set: sig.set.bind(sig),
		publish: sig.publish.bind(sig),
	})

	Object.defineProperty(f, "value", {
		get: () => sig.value,
		set: (v) => sig.value = v,
	})

	Object.defineProperty(f, "sneak", {
		get: () => sig.sneak,
		set: (v) => sig.sneak = v,
	})

	return f as SignalFn<V>
}

