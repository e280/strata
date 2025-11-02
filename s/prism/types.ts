
import {Lens} from "./lens.js"

export type LensLike<State> = {
	readonly state: Immutable<State>
	mutate<R>(fn: (state: State) => R): Promise<R>
	lens<S2>(selector: (state: State) => S2): Lens<S2>
}

export type Optic<State> = {
	getState: () => State
	mutate: <R>(fn: (state: State) => R) => Promise<R>
	registerLens: (lens: Lens<any>) => void
}

export type Immutable<T> =
	T extends (...args: any[]) => any ? T :
	T extends readonly any[] ? ReadonlyArray<Immutable<T[number]>> :
	T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } :
	T

export type Mutable<T> =
	T extends (...args: any[]) => any ? T :
	T extends ReadonlyArray<infer U> ? Mutable<U>[] :
	T extends object ? { -readonly [K in keyof T]: Mutable<T[K]> } :
	T

