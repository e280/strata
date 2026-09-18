
import {WaitState} from "./type.js"
import {isWaitOk, isWaitPending} from "./is.js"
import {waitGotErr, waitGot} from "./get.js"

export function waitSelect<Ret, Value, E = unknown>(state: WaitState<Value, E>, select: {
		pending?: () => Ret
		ok?: (value: Value) => Ret
		err?: (error: E) => Ret
	}) {

	const {
		pending = () => {},
		ok = () => {},
		err = () => {},
	} = select

	if (isWaitPending(state))
		return pending()

	else if (isWaitOk(state))
		return ok(waitGot(state))

	else
		return err(waitGotErr(state))
}

