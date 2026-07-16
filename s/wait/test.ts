
import {nap, gotOk} from "@e280/stz"
import {expect, suite, test} from "@e280/science"

import {wait} from "./parts/wait.js"
import {waitGotErr, waitGot} from "./parts/get.js"
import {isWaitDone, isWaitErr, isWaitPending} from "./parts/is.js"

export default suite({
	"wait fn, done": test(async() => {
		const $wait = wait(async() => {
			await nap()
			return 123
		})
		expect(isWaitPending($wait())).is(true)
		expect(await $wait.ready).is(123)
		expect(gotOk(await $wait.result)).is(123)
		expect(isWaitDone($wait())).is(true)
		expect(waitGot($wait())).is(123)
	}),

	"wait fn, failed": test(async() => {
		const $wait = wait<number, Error>(async() => {
			await nap()
			if (!!true) throw new Error("uh oh")
			return 123
		})
		expect(isWaitPending($wait())).is(true)
		expect(await $wait.ready).is(undefined)
		expect((await $wait.result).ok).is(false)
		expect(isWaitErr($wait())).is(true)
		expect(waitGotErr($wait()).message).is("uh oh")
	}),
})

