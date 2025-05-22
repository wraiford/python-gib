import { labelize } from "./respec-gib-helper.mjs";

export interface InfoBase {
    /**
     * Log context.
     */
    lc?: string;
    /**
     * If true, performs lots of trace verbose logging respeculation stuff.
     */
    logalot?: boolean;
}

export type MaybeAsyncFn<TReturn = void> =
    (() => TReturn) | (() => Promise<TReturn>);

export interface RespecFunctionInfo extends InfoBase {
    fn: MaybeAsyncFn;
}

export interface IfWeBlock extends InfoBase {

}

export interface RespecInfo extends InfoBase {
    /**
     * file path of spec. use meta.import.url
     */
    title: string;
    kind: 'respecfully' | 'ifwe';
    bodyFn: MaybeAsyncFn;
    parent?: RespecInfo;
    subBlocks: RespecInfo[];
    /**
     * function(s) that execute before any respeculations.
     */
    fnFirstOfAlls: MaybeAsyncFn[];
    fnFirstOfAllsComplete?: boolean;
    /**
     * function(s) that execute before each respeculation.
     */
    fnFirstOfEachs: MaybeAsyncFn[];
    /**
     * function(s) that execute after any respeculations.
     */
    fnLastOfAlls: MaybeAsyncFn[];
    fnLastOfAllsComplete?: boolean;
    /**
     * function(s) that execute after each respeculation.
     */
    fnLastOfEachs: MaybeAsyncFn[];
    /**
     * If the respecful block contains a reckoning via `iReckon`, then this will
     * be contain the resulting object of that reckoning.
     */
    reckonings: Reckoning[];
    /**
     * if true, block as completed execution
     */
    complete?: boolean;
    error?: any;
    /**
     * todo: stopOnFailure
     */
    // stopOnFailure: false,
    /**
     * If true, then this block is being focused on in testing.  This is a way
     * to isolate testing (like if you're working on testing one particular
     * function).
     */
    extraRespecful?: boolean;
}

export interface RespecOptions {
    // stopOnFailure?: boolean;
    overrideLc?: string;
    logalot?: boolean;
    /**
     * If true, then we're just checking the respec lib itself. This will not
     * include the block/reckoning in the final report.
     */
    justMetaTesting?: boolean;
    /**
     * If true, then this block is being focused on in testing.  This is a way
     * to isolate testing (like if you're working on testing one particular
     * function).
     */
    extraRespecful?: boolean;
}

/**
 * todo: fill this out with whitelisted function names.
 */
export type ReckoningFunctionName = 'willEqual' | string;

export interface ReckoningOptions {
    overrideLc?: string;
    addedMsg?: string;
    /**
     * If true, then we're just checking the respec lib itself. This will not
     * include the block/reckoning in the final report.
     */
    justMetaTesting?: boolean;
}

export interface ReckoningInfo {
    /**
     * fn name to execute
     */
    fnName?: ReckoningFunctionName | undefined;
    /**
     * need to rename. This is what the reckoning is testing against this.value
     * for some tests.
     */
    x?: any | undefined;
    /**
     * Optional addedMsg
     */
    addedMsg: string | undefined;
}

export class RespecGib {
    /**
     * All respec paths that were found with the given regexp and root
     * directory.
     */
    allRespecPaths: string[] = [];
    /**
     * the paths of respec files after taking into account filtering.
     * This includes atow "extra respec".
     */
    filteredRespecPaths: string[] | undefined;
    /**
     * Paths to respec files that were actually done. This is either going to be
     * `allRespecPaths` or `filteredRespecPaths`.
     */
    respecPaths: string[] = [];
    /**
     * If true, then we are looking for - and have found - files/blocks with
     * extra respec.
     *
     * Note that atow (03/2024), this affects ONLY reporting of test results. In
     * the future, we may add a separate flag.
     */
    extraRespecOnly: boolean = false;
    respecs: { [title: string]: RespecInfo[] } = {};
    errorMsgs: string[] = [];
    ifWeBlocksSkipped: number = 0;
}

export class Reckoning {
    private extraLabel: string | undefined = undefined;

    failMsg: string | undefined = undefined;
    justMetaTesting: boolean | undefined = undefined;

    #not: boolean = false;
    get not(): Reckoning {
        this.#not = !this.#not;
        return this;
    }

    completed: Promise<boolean> | undefined = undefined;

    constructor(
        private value: any,
        private logalot: boolean = false,
    ) {
    }

    /**
     * gives extra context for the test message.
     *
     * @param extraLabel for additional context info for the reckoning
     * @returns this reckoning for fluent method-chaining
     */
    asTo(extraLabel: string): Reckoning {
        this.extraLabel = extraLabel;
        return this;
    }

    /**
     * wrapper/synonym for {@link asTo}.
     *
     * @see {@link asTo}
     */
    wrt(extraLabel: string): Reckoning {
        return this.asTo(extraLabel);
    }

    /**
     * checks for strict equals ===.
     *
     * @param x value to test against this.value
     * @param opts
     * @returns this reckoning for fluent method-chaining
     */
    willEqual(x: any, opts?: ReckoningOptions): Reckoning {
        const lc = `[${this.willEqual.name}]`;
        const { logalot } = this;
        const { addedMsg, justMetaTesting } = opts ?? {};
        try {
            if (logalot) { console.log(`${lc} starting... (I: a07da12997b56d62347be2a71d984a23)`); }
            this.justMetaTesting = justMetaTesting;
            if (typeof x !== typeof this.value && !this.#not) {
                throw new Error(`Uh oh. this.value (${labelize(this.value)}) type (${typeof this.value}) is a different than ${labelize(x)} type (${typeof x}) ${addedMsg ? '(' + addedMsg + ')' : ''}(E: cdb0a3a75b611facfa6d80ff14839323)`);
            }
            if (typeof x === 'object') {
                if (!this.#not) {
                    if (this.value !== x) {
                        const thisValueString = JSON.stringify(this.value);
                        const xString = JSON.stringify(x);
                        if (thisValueString !== xString) {
                            throw new Error(`object comparison using JSON.stringify says these two objects are different. (E: 8375bab01f49dcac280c9dde0e120423)`);
                        }
                        // throw new Error(`clever object comparison is not implemented yet (E: 067c62f1767e25ab39f6aeffccb36e23)`);
                    }
                } else {
                    if (this.value === x) {
                        throw new Error(`Uh oh. Objects were supposed to be different but they are the same instance of the same object. (E: 3e62e334af53d37686f4009ca8274523)`);
                    }
                    const thisValueString = JSON.stringify(this.value);
                    const xString = JSON.stringify(x);
                    if (thisValueString === xString) {
                        throw new Error(`object comparison using JSON.stringify says these two objects are the same. (E: f661001788a440d08a54bea2e57df580)`);
                    }
                }
            } else {
                if (!this.#not) {
                    if (this.value !== x) {
                        throw new Error(`Uh oh. this.value (${labelize(this.value)}) does not strict equal ${labelize(x)} ${addedMsg ? '(' + addedMsg + ')' : ''}(E: a568969e5729ddb5176e7c76fbdd7b23)`);
                    }
                } else {
                    if (this.value === x) {
                        throw new Error(`Uh oh. this.value (${labelize(this.value)}) does strict equal ${labelize(x)} ${addedMsg ? '(' + addedMsg + ')' : ''}(E: cc68058d7fa84fbebee8d00cb705df69)`);
                    }
                }
            }
        } catch (error) {
            // const msg = `${lc} ${error.message}`;
            const msg = this.getErrorMsgLabeledAndWhatnot(lc, addedMsg, error);
            this.failMsg = msg;
        } finally {
            this.completed = Promise.resolve(true);
            if (logalot) { console.log(`${lc} complete.`); }
        }
        return this;
    }

    /**
     * checks for strict equals ===.
     * the same as willEqual atow
     *
     * @param x value to test against this.value
     * @param opts
     * @returns true if passes, false if fails
     */
    isGonnaBe(x: any, opts?: ReckoningOptions): Reckoning {
        const lc = `[${this.isGonnaBe.name}]`;
        return this.willEqual(x, { ...opts, overrideLc: lc });
    }

    /**
     * checks for truthy of this.value
     *
     * @param opts
     * @returns true if passes, false if fails
     */
    isGonnaBeTruthy(opts?: ReckoningOptions): Reckoning {
        const lc = `[${this.isGonnaBeTruthy.name}]`;
        const { logalot } = this;
        const { addedMsg, justMetaTesting } = opts ?? {};
        try {
            if (logalot) { console.log(`${lc} starting... (I: 8f3e2afedf3b4944bd2d824625ebfb00)`); }
            this.justMetaTesting = justMetaTesting;
            if (!this.#not) {
                if (!this.value) {
                    throw new Error(`Uh oh. Ain't truthy. this.value (${labelize(this.value)}) ${addedMsg ? '(' + addedMsg + ')' : ''}(E: 699e9465b6d64c6fb53a533024751acd)`);
                }
            } else {
                if (this.value) {
                    throw new Error(`Uh oh. It is truthy. this.value (${labelize(this.value)}) ${addedMsg ? '(' + addedMsg + ')' : ''}(E: 061557a7679e4e78ad38d3a9b83c8f8d)`);
                }
            }
        } catch (error) {
            // const msg = `${lc} ${error.message}`;
            const msg = this.getErrorMsgLabeledAndWhatnot(lc, addedMsg, error);
            this.failMsg = msg;
        } finally {
            this.completed = Promise.resolve(true);
            if (logalot) { console.log(`${lc} complete.`); }
        }
        return this;
    }
    isGonnaBeFalsy(opts?: ReckoningOptions): Reckoning {
        const lc = `[${this.isGonnaBeFalsy.name}]`;
        // const { logalot } = this;
        // const { addedMsg, justMetaTesting } = opts ?? {};
        return this.not.isGonnaBeTruthy({ ...opts, overrideLc: lc });
    }

    /**
     * checks for this.value === true (unless not'd)
     *
     * @param opts
     * @returns true if passes, false if fails
     */
    isGonnaBeTrue(opts?: ReckoningOptions): Reckoning {
        const lc = `[${this.isGonnaBeTrue.name}]`;
        const { logalot } = this;
        const { addedMsg, justMetaTesting } = opts ?? {};
        try {
            this.justMetaTesting = justMetaTesting;
            if (logalot) { console.log(`${lc} starting... (I: aade114a8ae7495a9d286a3ebc9be5ba)`); }
            if (!this.#not) {
                if (this.value !== true) {
                    throw new Error(`Uh oh. this.value ain't true: (${labelize(this.value)}) ${addedMsg ? '(' + addedMsg + ')' : ''}(E: aeca1221ba994f9eafef8f482e73f941)`);
                }
            } else {
                if (this.value === true) {
                    throw new Error(`Uh oh. It is true. this.value (${labelize(this.value)}) ${addedMsg ? '(' + addedMsg + ')' : ''}(E: cd61a7efa6034c7d94daf9f8f43cdaff)`);
                }
            }
        } catch (error) {
            // const msg = `${lc} ${error.message}`;
            const msg = this.getErrorMsgLabeledAndWhatnot(lc, addedMsg, error);
            this.failMsg = msg;
        } finally {
            this.completed = Promise.resolve(true);
            if (logalot) { console.log(`${lc} complete.`); }
        }
        return this;
    }

    /**
     * checks for this.value === false (unless not'd)
     *
     * @param opts
     * @returns true if passes, false if fails
     */
    isGonnaBeFalse(opts?: ReckoningOptions): Reckoning {
        const lc = `[${this.isGonnaBeFalse}]`;
        return this.willEqual(false, { ...opts, overrideLc: lc });
    }

    /**
     * checks for this.value === undefined (unless not'd)
     *
     * @param opts
     * @returns true if passes, false if fails
     */
    isGonnaBeUndefined(opts?: ReckoningOptions): Reckoning {
        const lc = `[${this.isGonnaBeUndefined.name}]`;
        const { logalot } = this;
        return this.willEqual(undefined, { ...opts, overrideLc: lc }); // checking this out
    }

    /**
     * checks for this.value.includes(x) (unless not'd)
     *
     * @param x value to check for inclusion in this.value
     * @param opts
     * @returns true if passes, false if fails
     */
    includes(x: any, opts?: ReckoningOptions): Reckoning {
        const lc = `[${this.includes.name}]`;
        const { logalot } = this;
        const { addedMsg, justMetaTesting } = opts ?? {};
        try {
            if (logalot) { console.log(`${lc} starting... (I: d270ce3e08284de3906447f508f8e912)`); }
            this.justMetaTesting = justMetaTesting;
            if (Array.isArray(this.value)) {
                let arr = this.value as any[];
                if (!this.#not) {
                    if (!arr.includes(x)) {
                        throw new Error(`Uh oh. this.value (${labelize(this.value)}) does NOT include ${labelize(x)} (E: c4a17172d5fbe6b637256b1c56c5c823)`);
                    }
                } else {
                    if (arr.includes(x)) {
                        throw new Error(`Uh oh. this.value (${labelize(this.value)}) DOES include ${labelize(x)} (E: c4a17172d5fbe6b637256b1c56c5c823)`);
                    }
                }
            } else if (typeof this.value === 'string') {
                let valueStr = this.value as string;
                let xStr = x as string;
                if (!this.#not) {
                    if (typeof x !== 'string') { throw new Error(`Uh oh. this.value is a string but testing against a non-string inclusion? Terribly sorry to disturb you on this one... (E: 962b88c207b5e701aaa2cb757bd97b23)`); }
                    if (!valueStr.includes(xStr)) {
                        throw new Error(`Uh oh. this.value (${labelize(this.value)}) does NOT include ${labelize(x)} (E: 28b572ece3364c669377f5431a5dcba8)`);
                    }
                } else {
                    if (valueStr.includes(xStr)) {
                        throw new Error(`Uh oh. this.value (${labelize(this.value)}) DOES include ${labelize(x)} (E: 7c041dd5e43c400fb8edc0460c9a1e4f)`);
                    }
                }
            } else {
                throw new Error(`Uh oh. this.value isn't an array nor a string, if you don't mind me saying. (E: a73a04323478016fc632d8697d695223)`);
            }
        } catch (error) {
            const msg = this.getErrorMsgLabeledAndWhatnot(lc, addedMsg, error);
            this.failMsg = msg;
        } finally {
            this.completed = Promise.resolve(true);
            if (logalot) { console.log(`${lc} complete.`); }
        }
        return this;
    }

    // #region helper functions

    /**
     * long silly names means I need to refactor them. it's an indicator, conscious decision. eesh.
     * @param lc log context
     * @param error catch block error
     * @returns error msg with extraLabel if assigned
     */
    getErrorMsgLabeledAndWhatnot(lc: string, addedMsg: string | undefined, error: any): string {
        let msg: string = lc;
        if (this.extraLabel) { msg += `[${this.extraLabel}]`; }
        if (addedMsg) { msg += `[${addedMsg}]`; }
        msg += ` ${error.message}`;
        return msg;
    }

    // #endregion helper functions

}
