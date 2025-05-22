
// DO NOT DECLARE FILE-LEVEL LOGALOT, AS THIS VARIABLE IS SET LOCALLY IN THIS FILE'S FUNCTIONS.

import { MaybeAsyncFn, Reckoning, RespecGib, RespecInfo, RespecOptions } from "./respec-gib-types.mjs";


/**
 * This global object via `globalThis.respecGib` contains the
 * state of respec(s) to be/being/been executed.
 *
 * @returns the current respecGib object
 */
export function getGlobalRespecGib(): RespecGib {
    if (!(globalThis as any).respecGib) {
        (globalThis as any).respecGib = new RespecGib();
    }
    return (globalThis as any).respecGib;
}

/**
 * gets the most recent non-nested (non-subblock) respecInfo from the global
 * state for the given `title`.
 *
 * @param title unique to file, use import.meta.url
 * @returns respecInfo for the given `title`
 */
export function getRespec(title: string): RespecInfo {
    const { respecs } = getGlobalRespecGib();
    const existingInfos = respecs[title] ?? [];
    if (existingInfos.length > 0) {
        return existingInfos.at(-1)!;
    } else {
        // no existing infos
        throw new Error(`no respec yet (E: abb1ca2f20fa521c92713ce81029ca23)`);
    }
}

/**
 * gets the most recent non-complete sub-block or if none, returns the
 * incoming respecInfo block.
 *
 * @param block root respecInfo block
 */
export function getActiveRespecfullyBlock(block: RespecInfo): RespecInfo {
    const activeSubblocks = block.subBlocks.filter(x => x.kind === 'respecfully' && !x.complete);
    if (activeSubblocks.length === 0) {
        return block;
    } else if (activeSubblocks.length === 1) {
        return getActiveRespecfullyBlock(activeSubblocks[0]);
    } else {
        throw new Error(`should only be one non-complete subblock (E: 677b425e787ebb111107882ef7136223)`);
    }
}

export async function openRespecfullyBlock(block: RespecInfo): Promise<void> {
    const { respecs } = getGlobalRespecGib();
    let respecBlocks = respecs[block.title];
    if (!respecBlocks) {
        respecBlocks = [];
        respecs[block.title] = respecBlocks;
    }
    const mostRecentBlock = respecBlocks.at(-1);
    if (!mostRecentBlock || mostRecentBlock.complete) {
        respecBlocks.push(block);
    } else {
        const parent = getActiveRespecfullyBlock(mostRecentBlock);
        parent.subBlocks.push(block);
        block.parent = parent;
        block.logalot = parent.logalot;
        block.lc = `${parent.lc}${block.lc}`;
        block.fnFirstOfEachs = parent.fnFirstOfEachs.concat();

        // execute first of alls which should have been initialized already (if
        // any).
        if (!parent.fnFirstOfAllsComplete) {
            for (let i = 0; i < parent.fnFirstOfAlls.length; i++) {
                await parent.fnFirstOfAlls[i]();
            }
            parent.fnFirstOfAllsComplete = true;
        }
    }
}

export async function closeRespecBlock(block: RespecInfo, logalot?: boolean): Promise<void> {
    const lc = `[${closeRespecBlock.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 31a2d6ae8edb711b68b1f439c2fa1923)`); }
        if (!logalot) {
            logalot = block.logalot;
            if (logalot) { console.log(`${lc} starting... (I: e4524212e0dc436c8faf0a998aafb630)`); }
        }

        const { extraRespecOnly } = getGlobalRespecGib();
        if (extraRespecOnly) {
            if (block.extraRespecful && block.subBlocks.length > 0) {
                block.subBlocks.forEach(x => x.extraRespecful = true);
            }
            if (block.subBlocks.some(x => !!x.extraRespecful)) {
                block.extraRespecful = true;
            }
        }

        // #region print respec blocks results

        // get the passing ifWe blocks
        const ifWeBlocks = block.subBlocks.filter(x => x.kind === 'ifwe');
        const passedIfWeBlocks: RespecInfo[] = [];
        const failedIfWeBlocks: RespecInfo[] = [];
        const erroredIfWeBlocks: RespecInfo[] = [];
        const skippedIfWeBlocks: RespecInfo[] = [];
        for (let i = 0; i < ifWeBlocks.length; i++) {
            const ifWeBlock = ifWeBlocks[i];
            if (ifWeBlock.error) {
                erroredIfWeBlocks.push(ifWeBlock);
                continue;
            }
            if (extraRespecOnly && !ifWeBlock.extraRespecful) {
                skippedIfWeBlocks.push(ifWeBlock);
                continue;
            }

            await Promise.all(ifWeBlock.reckonings.map(r => r.completed));
            const reckonings = ifWeBlock.reckonings.filter(r => !r.justMetaTesting);

            const prefix = `[${block.title.split('/').at(-1)!}${block.lc}${ifWeBlock.lc ?? 'no ifWe.lc?'}`;
            const emojifail = (s: string) => { return `💔 ${prefix}${s}`; }

            const reckoningPasses: Reckoning[] = [];
            const reckoningFails: Reckoning[] = [];
            for (const reckoning of reckonings) {
                if (reckoning.failMsg) {
                    console.error('\x1b[31m%s\x1b[0m', emojifail(reckoning.failMsg));  // red
                    reckoningFails.push(reckoning);
                } else {
                    reckoningPasses.push(reckoning);
                }
            }

            const totalCount = reckoningPasses.length + reckoningFails.length;

            if (totalCount === reckoningPasses.length) {
                // const passMsg = `${prefix} ${passes.length} of ${totalCount} ${passes.join('')} reckonings passed`;
                const passMsg = `💚 ${prefix} ALL ${totalCount} of ${totalCount} reckonings were respecful`;
                console.log('\x1b[32m%s\x1b[0m', passMsg);  // green
                passedIfWeBlocks.push(ifWeBlock);
            } else if (totalCount === reckoningFails.length) {
                const failedMsg = `${prefix} COMPLETE DISrespec. ZERO of ${totalCount} respecful reckonings`;
                failedIfWeBlocks.push(ifWeBlock);
                console.error('\x1b[31m%s\x1b[0m', failedMsg);  // red
            } else {
                const failedMsg = `${prefix} PARTIAL DISrespec. ${reckoningFails.length} out of ${totalCount} DISrespecful reckonings 💔`;
                failedIfWeBlocks.push(ifWeBlock);
                // console.error('\x1b[33m%s\x1b[0m', failedMsg);  // yellow
                console.error('\x1b[31m%s\x1b[0m', failedMsg);  // red
            }
        }

        for (let i = 0; i < passedIfWeBlocks.length; i++) {
            const ifWeBlock = passedIfWeBlocks[i];
            const prefix = `[${block.title.split('/').at(-1)!}${block.lc}${ifWeBlock.lc ?? 'no ifWe.lc?'}`;
            const emojifail = (s: string) => { return `💔 ${prefix}${s}`; }
            const msg = `  ${prefix} ✅`;
            console.log('\x1b[32m%s\x1b[0m', msg);  // green
        }
        for (let i = 0; i < failedIfWeBlocks.length; i++) {
            const ifWeBlock = failedIfWeBlocks[i];
            const prefix = `[${block.title.split('/').at(-1)!}${block.lc}${ifWeBlock.lc ?? 'no ifWe.lc?'}`;
            const emojifail = (s: string) => { return `💔 ${prefix}${s}`; }
            const msg = `  ${prefix} 🟥`;
            console.log('\x1b[31m%s\x1b[0m', msg);  // green
        }

        if (erroredIfWeBlocks.length > 0 || failedIfWeBlocks.length > 0) {
            const prefix = `[${block.title.split('/').at(-1)!}${block.lc}`;
            const msg = `  ${prefix} DISrespec 💔`;
            console.log('\x1b[31m%s\x1b[0m', msg);  // red
            block.error = new Error('there was DISrespec');
            getGlobalRespecGib().errorMsgs.push(msg);
        } else if (passedIfWeBlocks.length > 0) {
            const prefix = `[${block.title.split('/').at(-1)!}${block.lc}`;
            const msg = `  ${prefix} ✅`;
            console.log('\x1b[32m%s\x1b[0m', msg);  // green
        }

        if (skippedIfWeBlocks.length > 0) {
            // console.log('\x1b[33m%s\x1b[0m', `${skippedIfWeBlocks.length} ifWe blocks skipped out of respec.`);  // yellow
            getGlobalRespecGib().ifWeBlocksSkipped += skippedIfWeBlocks.length;
        }

        // #endregion print respec blocks results

        // execute fnLastOfAll functions
        if (!block.fnLastOfAllsComplete) {
            for (let i = 0; i < block.fnLastOfAlls.length; i++) {
                await block.fnLastOfAlls[i]();
            }
            block.fnLastOfAllsComplete = true;
        }
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        block.error = error;
        throw error; // throw?
    } finally {
        block.complete = true;
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

export async function respecfully(title: string, label: string, fn: MaybeAsyncFn, opts?: RespecOptions): Promise<void> {
    let lc = `[${respecfully.name}]`;
    let { logalot, overrideLc, extraRespecful } = opts ?? {};
    if (!!overrideLc || overrideLc === '') { lc = overrideLc; }
    try {
        if (logalot) { console.log(`${lc} starting... (I: 6093b8f34b1f35da6416449cd16a3223)`); }
        label ||= 'well sir/maam/other, we seemed to have perhaps forgot the label for this respecful block.';

        if (!fn) { throw new Error(`fn required (E: 23624f705087ed6c27a3ff2a616d7b23)`); }

        // build a new respec block for this instantiation.
        // nested respec will point to parent automagically
        const respecInfo: RespecInfo = {
            title,
            lc: `[${label}]`,
            logalot,
            kind: 'respecfully',
            bodyFn: fn,
            fnFirstOfAlls: [],
            fnFirstOfEachs: [],
            fnLastOfAlls: [],
            fnLastOfEachs: [],
            subBlocks: [],
            reckonings: [],
            extraRespecful,
        };

        // sets the corresponding global respec info corresponding to title
        await openRespecfullyBlock(respecInfo);

        // execute the respecful body lambda
        await fn();

        await closeRespecBlock(respecInfo);
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}
export async function respecfullyDear(title: string, label: string, fn: MaybeAsyncFn, opts?: RespecOptions): Promise<void> {
    return respecfully(title, label, fn, { ...(opts ?? {}), extraRespecful: true });
}

/**
 * Execute this function ONCE before the FIRST ifWe block is executed.
 *
 * @param title unique to file, use import.meta.url
 * @param fn to execute
 * @param logalot true for verbose trace logging
 */
export function firstOfAll(title: string, fn: MaybeAsyncFn, logalot?: boolean): void {
    const lc = `[${firstOfAll.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: f06eb90d3afb4e85a121173805fbd43f)`); }

        if (!fn) { throw new Error(`fn required (E: d5ac5d6c7a144532bdc22f608ec8ef15)`); }

        // const respec = getRespec(title);
        let respec = getRespec(title);
        respec = getActiveRespecfullyBlock(respec);
        if (respec.fnFirstOfAllsComplete) {
            throw new Error(`cannot add a fnFirstOfAll after an ifWe block  (E: bf9cceedcae3248022ca84ecafd76623)`);
        }
        respec.fnFirstOfAlls.push(fn);
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * Execute this function before EACH & EVERY ifWe block is executed.
 *
 * @param title unique to file, use import.meta.url
 * @param fn to execute
 * @param logalot true for verbose trace logging
 */
export function firstOfEach(title: string, fn: MaybeAsyncFn, logalot?: boolean): void {
    const lc = `[${firstOfEach.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: d98af0af339c4b6cb823491f3142736b)`); }

        if (!fn) { throw new Error(`fn required (E: 7dc1bf89ed684a3080bdb219e68de4da)`); }

        let respec = getRespec(title);
        respec = getActiveRespecfullyBlock(respec);
        respec.fnFirstOfEachs.push(fn);
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * Execute this function ONCE AFTER the LAST ifWe block is executed.
 *
 * @param title unique to file, use import.meta.url
 * @param fn to execute
 * @param logalot true for verbose trace logging
 */
export function lastOfAll(title: string, fn: MaybeAsyncFn, logalot?: boolean): void {
    const lc = `[${lastOfAll.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 1c1064404eb74534bffcea4b0c32d079)`); }

        if (!fn) { throw new Error(`fn required (E: 0ad93cf2cdb642879055299d92e344d3w)`); }

        let respec = getRespec(title);
        respec = getActiveRespecfullyBlock(respec);
        if (respec.fnLastOfAllsComplete) { throw new Error(`cannot add a fnLastOfAll after an ifWe block  (E: 45c98578cce647cfa6b99e64703fe613)`); }
        respec.fnLastOfAlls.push(fn);
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * Execute this function AFTER EACH & EVERY ifWe block is executed.
 *
 * @param title unique to file, use import.meta.url
 * @param fn to execute
 * @param logalot true for verbose trace logging
 */
export function lastOfEach(title: string, fn: MaybeAsyncFn, logalot?: boolean): void {
    const lc = `[${lastOfEach.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: e4ea48405c764f708f1f077776b6633c)`); }

        if (!fn) { throw new Error(`fn required (E: 16e10dc0ef3d410bb628a7d05c470775)`); }

        let respec = getRespec(title);
        respec = getActiveRespecfullyBlock(respec);
        respec.fnLastOfEachs.push(fn);
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * Respeculation block that should contain reckonings (iReckon functions).
 *
 * ## notes
 *
 * you can't...
 * * add firstOfEach/All after the first of these blocks
 * * add respecfully blocks inside this block
 * * nest these blocks
 *
 * @param title unique to file, use import.meta.url
 * @param label label of respec
 * @param fn to execute
 * @param logalot true for verbose trace logging
 */
export async function ifWe(title: string, label: string, fn: MaybeAsyncFn, opts?: RespecOptions): Promise<void> {
    let lc = `[${ifWe.name}][${label ?? 'no label?'}]`;
    let { logalot, overrideLc, extraRespecful } = opts ?? {};
    if (!!overrideLc || overrideLc === '') { lc = overrideLc; }
    try {
        if (logalot) { console.log(`${lc}[${label}] starting... (I: a321aeeab5144c518db3e03da25506bd)`); }

        if (!fn) { throw new Error(`fn required (E: 2acfc615924145618f96be53b208186b)`); }

        // get the currently executing respecfully block for this title/file
        let respec = getRespec(title);
        respec = getActiveRespecfullyBlock(respec);
        if (!logalot) {
            if (respec.logalot) { logalot = true; }
            if (logalot) { console.log(`${lc}[${label}] starting... (I: 38dac8ce84604b8991bfe88f4947f5a2)`); }
        }
        const ifWeBlock: RespecInfo = {
            title,
            logalot,
            kind: 'ifwe',
            reckonings: [],
            fnFirstOfAlls: [],
            fnFirstOfEachs: [],
            fnLastOfAlls: [],
            fnLastOfEachs: [],
            subBlocks: [],
            lc: `[${label}]`,
            bodyFn: fn,
            extraRespecful,
        };
        respec.subBlocks.push(ifWeBlock);
        if (!respec.fnFirstOfAllsComplete) {
            for (let i = 0; i < respec.fnFirstOfAlls.length; i++) {
                await respec.fnFirstOfAlls[i]();
            }
            respec.fnFirstOfAllsComplete = true;
        }
        for (let i = 0; i < respec.fnFirstOfEachs.length; i++) {
            const fnFirstOfEach = respec.fnFirstOfEachs[i];
            if (logalot) { console.log(`${lc} firstOfEach executing for '${label}' (I: 849fa60aea0561aa5d3bd52755ac7823)`); }
            try {
                await fnFirstOfEach();
            } catch (error) {
                ifWeBlock.error = error;
                ifWeBlock.complete = true;
                return; /* <<<< returns early */
            }
        }


        // see how many reckonings we start with, to compare with after fn exec
        const initialReckoningCount = ifWeBlock.reckonings.length;

        // execute the respec body
        try {
            await fn();
        } catch (error) {
            ifWeBlock.error = error;
            ifWeBlock.complete = true;
            return; /* <<<< returns early */
        }

        // execute fnLastOfEach functions of current/parent block(s)
        let blockToExecute: RespecInfo | undefined = respec;
        do {
            for (let i = 0; i < blockToExecute.fnLastOfEachs.length; i++) {
                const fnLastOfEach = blockToExecute.fnLastOfEachs[i];
                if (logalot) { console.log(`${lc} lastOfEach executing for '${label}' (I: 2f1ad3c488a648b0b3e8bb6db42c1f87)`); }
                try {
                    await fnLastOfEach();
                } catch (error) {
                    ifWeBlock.error = error;
                    ifWeBlock.complete = true;
                    return; /* <<<< returns early */
                }
            }
            blockToExecute = blockToExecute.parent ?? undefined;
        } while (!!blockToExecute)

        // compare reckoning count, because it's unexpected if the user didn't
        // have a reckoning in this block
        const postBlockCount = ifWeBlock.reckonings.length;
        if (initialReckoningCount === postBlockCount) {
            const prefix = `[${ifWeBlock.title.split('/').at(-1)!}${ifWeBlock.lc}`;
            console.warn('\x1b[33m%s\x1b[0m', `${prefix}${lc} There were no iReckon reckonings in this ifWe block. Did you forget to respec yourself? (W: c188125dd7cc4100821f4c9c6cb1462a)`);
        }
        ifWeBlock.complete = true;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

export async function ifWeMight(title: string, label: string, fn: MaybeAsyncFn, opts?: RespecOptions): Promise<void> {
    return ifWe(title, label, fn, { ...(opts ?? {}), extraRespecful: true });
}

/**
 * starts a reckoning on what you figure.
 *
 * ## notes
 *
 * * this is similar to an expectation or assertion in other worlds, but way better.
 *
 * @param title unique to file, use import.meta.url
 * @param x value to test against this.value
 * @returns the reckoning instance
 */
export function iReckon(title: string, x: any): Reckoning {
    // const reckoning = new Reckoning(clone(x));
    const reckoning = new Reckoning(x);
    const respecInfo = getRespec(title);
    const activeBlock = getActiveRespecfullyBlock(respecInfo);
    const currentIfWe = activeBlock.subBlocks.filter(x => x.kind === 'ifwe').at(-1);
    if (!currentIfWe) { throw new Error(`iReckon can only occur inside of an ifWe block (E: 6f3cc46b8d9c22263b4c37121e26b623)`); }
    currentIfWe.reckonings.push(reckoning);
    return reckoning;
}
