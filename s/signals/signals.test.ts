
import {Science} from "@e280/science"

import effectTest from "./tests/effect.test.js"
import signalTest from "./tests/signal.test.js"
import deriveTest from "./tests/derive.test.js"
import lazyTest from "./tests/lazy.test.js"

export default Science.suite({
	"effect": effectTest,
	"signal": signalTest,
	"derive": deriveTest,
	"lazy": lazyTest,
})

