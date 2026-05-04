
import {Tracker} from "./tracker.js"

/** standard global tracker for integrations */
export const tracker: Tracker = (globalThis as any)[Symbol.for("e280.tracker.2")] ??= new Tracker()

