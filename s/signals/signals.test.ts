
import {Science} from "@e280/science"
import signalTest from "./tests/signal.test.js"
import signalFnTest from "./tests/signal-fn.test.js"
import effectTest from "./tests/effect.test.js"
import lazyTest from "./tests/lazy.test.js"
import deriveTest from "./tests/derive.test.js"

export default Science.suite({
	"signal": signalTest,
	"signal.fn": signalFnTest,
	"effect": effectTest,
	"lazy": lazyTest,
	"derive": deriveTest,
})

