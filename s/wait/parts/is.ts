
import {WaitState, WaitResult, WaitErr, WaitOk, WaitPending} from "./type.js"

export const isWaitPending = (state: WaitState<unknown>): state is WaitPending => !state.done
export const isWaitDone = <Value, E = unknown>(state: WaitState<Value, E>): state is WaitResult<Value, E> => state.done
export const isWaitOk = <Value>(state: WaitState<Value, unknown>): state is WaitOk<Value> => state.done && state.ok
export const isWaitErr = <E = unknown>(state: WaitState<unknown, E>): state is WaitErr<E> => state.done && !state.ok

