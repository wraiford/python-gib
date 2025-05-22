import { DEFAULT_DATA_PATH_DELIMITER, HELPER_LOG_A_LOT, ONLY_HAS_NON_ALPHANUMERICS } from "../constants.mjs";

const logalot = HELPER_LOG_A_LOT || false;

let crypto: any = globalThis.crypto;
let { subtle } = crypto;

export type HashAlgorithm = 'SHA-256' | 'SHA-512';
export const HashAlgorithm: { [key: string]: HashAlgorithm } = {
    'sha_256': 'SHA-256' as HashAlgorithm,
    'sha_512': 'SHA-512' as HashAlgorithm,
}

export function clone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}
export function getTimestamp(date?: Date) {
    return (date ?? new Date()).toUTCString();
}

/**
 * Simple hash function.
 *
 * NOTE:
 *   This is not used for ibGib.gib values (ATOW)
 *   but rather as a helper function for generating random UUIDs.
 *
 * @param s string to hash
 * @param algorithm to use, currently only 'SHA-256'
 */
export async function hash({
    s,
    algorithm = 'SHA-256',
}: {
    s: string,
    algorithm?: HashAlgorithm,
}): Promise<string> {
    if (!s) { return ''; }

    try {
        const validAlgorithms = Object.values(HashAlgorithm);
        if (!validAlgorithms.includes(algorithm)) {
            throw new Error(`Only ${validAlgorithms} implemented (E: 73cb52cd4d7f70c3415fdf695ba6ba23)`);
        }
        const msgUint8 = new TextEncoder().encode(s);
        const buffer = await subtle.digest(algorithm, msgUint8);
        const asArray = Array.from(new Uint8Array(buffer));
        return asArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error(extractErrorMsg(error.message));
        throw error;
        // return ''; // why had I decided to return an empty string on error?
    }
}

/**
 * Simple func to generate UUID (sha-256 hash basically).
 *
 * @param seedSize size of seed for UUID generation
 */
export async function getUUID(seedSize = 64): Promise<string> {
    let uuid: string = '';
    if (seedSize < 32) { throw new Error(`Seed size must be at least 32`); }
    if (!globalThis.crypto) { throw new Error(`Cannot create UUID, as unknown crypto library version. If using node.js, v19+ is required. (E: c02cee3fd8a94f678d3f4ebe9dc49797)`); }

    const values = crypto.getRandomValues(new Uint8Array(16));
    uuid = await hash({ s: values.join('') });

    if (!uuid) { throw new Error(`Did not create UUID...hmm...`); }

    return uuid;
}

/**
 * Syntactic sugar for JSON.stringify(obj, null, 2);
 *
 * @param obj to pretty stringify
 */
export function pretty(obj: any): string {
    return JSON.stringify(obj, null, 2);
}

/**
 * Just delays given number of ms.
 *
 * @param ms milliseconds to delay
 */
export async function delay(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

/**
 * extracts the error message from an error object/string/falsy arg.
 *
 * ## notes
 *
 * * some libs throw errors, some throw just strings.
 * * who knows what else it could be.
 *
 * ## todo
 *
 * * extract inner errors/causes if we ever use this function extensively.
 *
 * @param error the error object in the catch area of the try..catch block.
 * @returns error.message if it's a string, error itself if it's a string, or canned error messages if it's falsy or none of the above.
 */
export function extractErrorMsg(error: any): string {
    if (!error && error !== 0) {
        return '[error is falsy]';
    } else if (typeof error === 'string') {
        return error;
    } else if (typeof error.message === 'string') {
        return error.message;
    } else if (typeof error === 'number') {
        return JSON.stringify(error);
    } else if (!!error.error) {
        // the caller has used the "wrong" signature type
        console.warn(`[${extractErrorMsg.name}] this fn takes the raw error object. no destructure required. change your call from extractErrorMsg({error}) to extractErrorMsg(error). (W: ea49af5fd76d4b80a55a108d73a3e9b4)`);
        return extractErrorMsg(error.error);
    } else {
        return `[error is not a string and error.message is not a string. typeof error: ${typeof error} (E: d5a7723ca59646838308bc9e53a43134)]`;
    }
}

export function groupBy<TItem>({
    items,
    keyFn,
}: {
    items: TItem[],
    keyFn: (x: TItem) => string,
}): { [key: string]: TItem[] } {
    const lc = `[${groupBy.name}]`;
    try {
        const result: { [key: string]: TItem[] } = {};
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const key = keyFn(item);
            result[key] = [...(result[key] ?? []), item];
        }
        return result;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    }
}


/**
 * Just trying to centralize and standardize regular expressions here...
 */
export function getRegExp({
    min,
    max,
    chars,
    noSpaces,
}: {
    min?: number,
    max?: number,
    chars?: string,
    noSpaces?: boolean,
}): RegExp {
    min = min ?? 1;
    max = max ?? 999999999999;
    chars = chars ?? '';

    return noSpaces ?
        new RegExp(`^[\\w${chars}]{${min},${max}}$`) :
        new RegExp(`^[\\w\\s${chars}]{${min},${max}}$`);
}

/**
 * syntactic sugar for `(new Date()).getTime().toString()`
 * @returns ticks string
 */
export function getTimestampInTicks(timestamp?: string): string {
    let date: Date;
    if (timestamp) {
        date = new Date(timestamp);
        if (date.toString() === "Invalid Date") {
            throw new Error(`invalid date created by timestamp (${timestamp}) (E: cbd6aeefe00708184e276ea3c2532b22)`);
        }
    } else {
        date = new Date();
    }
    return date.getTime().toString();
}

/**
 * ## requires
 * at least either `startDate` or one of the intervals to be truthy.
 *
 * ## thanks
 *
 * https://stackoverflow.com/questions/8609261/how-to-determine-one-year-from-now-in-javascript
 *
 * ## tested manually eek
```
console.log(new Date().toUTCString());
// Mon, 14 Feb 2022 14:19:32 GMT
console.log(getExpirationUTCString({years: 1}));
// Tue, 14 Feb 2023 14:19:32 GMT
console.log(getExpirationUTCString({months: 13}));
// Tue, 14 Mar 2023 13:19:32 GMT
console.log(getExpirationUTCString({days: 365}));
// Tue, 14 Feb 2023 14:19:32 GMT
console.log(getExpirationUTCString({days: 45}));
// Thu, 31 Mar 2022 13:19:32 GMT
console.log(getExpirationUTCString({years: 1, days: 45, hours: 25, seconds: 70}));
// Sat, 01 Apr 2023 14:20:42 GMT
console.log(getExpirationUTCString({days: 10, hours: 10, seconds: 10}));
// Fri, 25 Feb 2022 00:19:42 GMT
console.log(getExpirationUTCString({years: 1, days: 45, hours: 25, seconds: 70}));
// Sat, 01 Apr 2023 14:20:42 GMT
console.log(getExpirationUTCString({years: 1, days: 45, hours: 25, seconds: 35}));
// Sat, 01 Apr 2023 14:20:07 GMT
```
 */
export function getExpirationUTCString({
    startDate,
    years,
    months,
    days,
    hours,
    seconds,
}: {
    startDate?: Date,
    years?: number,
    months?: number,
    days?: number,
    hours?: number,
    seconds?: number,
}): string {
    const lc = `[${getExpirationUTCString.name}]`;
    try {
        return addTimeToDate({
            startDate, years, months, days, hours, seconds,
        }).toUTCString();
    } catch (error) {
        console.log(`${lc} ${error.message}`);
        throw error;
    }
}

export function addTimeToDate({
    startDate,
    years,
    months,
    days,
    hours,
    seconds,
}: {
    startDate?: Date,
    years?: number,
    months?: number,
    days?: number,
    hours?: number,
    seconds?: number,
}): Date {
    const lc = `[${addTimeToDate.name}]`;
    try {
        if (!startDate && !years && !months && !days && !hours && !seconds) {
            // throw here because otherwise we would return an expiration
            // timestamp string with now as the expiration, which doesn't make
            // sense.
            throw new Error(`either startDate or a time interval required. (E: 30248f8b306f443ab036fa8c313c50d8)`);
        }

        // don't want to mutate the incoming date
        startDate = startDate ?
            new Date(startDate) :
            new Date(); // default to now

        /** incoming years/months/days/hours/seconds to add to start date */
        let intervalToAdd: number;
        /** start date + interval in ticks, before assigning to Date obj */
        let newDateTicks: number;

        if (years) {
            intervalToAdd = startDate.getFullYear() + years;
            newDateTicks = startDate.setFullYear(intervalToAdd);
            // call recursively for other interval args (if any)
            return addTimeToDate({
                startDate: new Date(newDateTicks),
                months, days, hours, seconds, // all but years (just set)
            })
        } else if (months) {
            intervalToAdd = startDate.getMonth() + months;
            newDateTicks = startDate.setMonth(intervalToAdd);
            // call recursively for other interval args (if any)
            return addTimeToDate({
                startDate: new Date(newDateTicks),
                years, days, hours, seconds, // all but months (just set)
            })
        } else if (days) {
            intervalToAdd = startDate.getDate() + days;
            newDateTicks = startDate.setDate(intervalToAdd);
            // call recursively for other interval args (if any)
            return addTimeToDate({
                startDate: new Date(newDateTicks),
                years, months, hours, seconds, // all but days (just set)
            })
        } else if (hours) {
            intervalToAdd = startDate.getHours() + hours;
            newDateTicks = startDate.setHours(intervalToAdd);
            // call recursively for other interval args (if any)
            return addTimeToDate({
                startDate: new Date(newDateTicks),
                years, months, days, seconds, // all but hours (just set)
            })
        } else if (seconds) {
            intervalToAdd = startDate.getSeconds() + seconds;
            newDateTicks = startDate.setSeconds(intervalToAdd);
            // call recursively for other interval args (if any)
            return addTimeToDate({
                startDate: new Date(newDateTicks),
                years, months, days, hours, // all but seconds (just set)
            })
        } else {
            // we've called our function recursively and all intervals args
            // falsy now, so startDate is the output date.
            return startDate;
        }
    } catch (error) {
        console.log(`${lc} ${error.message}`);
        throw error;
    }
}

export function isExpired({
    expirationTimestampUTC,
}: {
    expirationTimestampUTC: string,
}): boolean {
    const lc = `[${isExpired.name}]`;
    try {
        if (!expirationTimestampUTC) { throw new Error(`expirationTimestampUTC required (E: 5eeb1e29f93d64f70c71a8112080a222)`); }

        let expirationDate = new Date(expirationTimestampUTC);
        if (expirationDate.toUTCString() === "Invalid Date") { throw new Error(`invalid expirationTimestampUTC: ${expirationTimestampUTC} (E: 66a1a165bcf1f9336fe78856ab777822)`); }

        const now = new Date();
        const expired = expirationDate < now;
        return expired;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    }
}

/**
 * Creates a new array that is a unique set of incoming `arr`.
 * @param arr array to make unique
 * @returns new array with unique items
 */
export function unique<T>(arr: T[]): T[] {
    return Array.from(new Set<T>(arr));
}

// export function getExt(path: string): { filename: string, ext: string } {
//     const pathPieces = path.split('/');
//     const fullFilename = pathPieces[pathPieces.length-1];
//     if (fullFilename.includes('.') && !fullFilename.endsWith('.')) {
//         const lastDotIndex = fullFilename.lastIndexOf('.');
//         return {
//             filename: fullFilename.slice(0, lastDotIndex),
//             ext: fullFilename.slice(lastDotIndex+1),
//         };
//     } else {
//         return {filename: fullFilename, ext: ""}
//     }
// }

export function patchObject({
    obj,
    value,
    path,
    pathDelimiter,
    logalot,
}: {
    obj: Object,
    value: any,
    path: string,
    pathDelimiter?: string,
    logalot?: number | boolean,
}): void {
    const lc = `[${patchObject.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting...`); }
        if (!obj) { throw new Error(`obj required (E: 6a9dd32a361476e80b1bf7b91ec50522)`); }
        if (typeof obj !== 'object') { throw new Error(`obj must be type 'object' (E: 66fdc289b32c06492bd95f5d266e6a22)`); }
        if (!path) { throw new Error(`path required (at the very least should be the key in the root obj.) (E: fc779e7794ead8a0b44e5f2e776b0e22)`); }

        /** atow defaults to a forward slash, but could be a dot or who knows */
        pathDelimiter = pathDelimiter || DEFAULT_DATA_PATH_DELIMITER;

        /**
         * the target starts off at the object level itself, but we will
         * traverse the given path, updating the targetObj as we go.
         */
        let targetObj: { [key: string | number]: any } = obj;
        const pathPieces = path.split(pathDelimiter).filter(x => !!x);

        /** the last one is the key into the final targetObj with value */
        const key = pathPieces.pop()!;

        // ensure each intermediate path exists and is an object
        pathPieces.forEach(piece => {
            let currentValue = targetObj[piece];
            if (currentValue) {
                if (typeof currentValue !== 'object') { throw new Error(`invalid path into object. Each step along the path must be typeof === 'object', but typeof targetObj["${piece}"] === ${typeof currentValue}. (value: ${currentValue})  (E: 38cf29c5f624a40b4b56502c2ec39d22)`); }
            } else {
                // if not exist, create it
                targetObj[piece] = {};
            }

            // update targetObj ref
            targetObj = targetObj[piece];
        });

        // reached target depth, so finally set the value
        targetObj[key] = value;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

export async function getIdPool({
    n,
}: {
    n: number,
}): Promise<string[]> {
    const lc = `[${getIdPool.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting...`); }
        let result: string[] = [];
        for (let i = 0; i < n; i++) {
            const id = await getUUID();
            result.push(id.substring(0, 16));
        }
        return result;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

export function getSaferSubstring({
    text,
    length,
    keepLiterals = ['-'],
    replaceMap,
}: {
    text: string;
    length?: number,
    /**
     * list of strings that you want to keep in the resultant string verbatim (without alteration).
     *
     * ## driving use case
     *
     * I want user comments that start with a question mark (?) to signify a
     * request to a robbot, e.g. "?start someAddr^gib" or whatever. So I want to
     * keep the question mark.  I thought of an encoding mapping, like ? =>
     * "__qstmark__" but it's easier just to keep it, as this function was
     * originally intended to just nerf text in general because there was no
     * reason not to. well now there is a reason.
     *
     * I'm adding in a couple other characters in common use for whenever I get around
     * to making those mean something in the app (#, @)
     */
    keepLiterals?: string[],
    /**
     *
     */
    replaceMap?: { [s: string]: string },
}): string {
    const lc = `[${getSaferSubstring.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 27437e312e5aa621adfebb84e059c822)`); }
        if (!text) { throw new Error(`text required (E: 87e0493613c8b30dfade83e1d2862a22)`); }

        let saferText: string = text;

        // before stripping "unsafe" characters, replace all instances of
        // keepLiterals with a temporary token if applicable
        let tokenToKeepMap: { [token: string]: string } = {};
        keepLiterals = keepLiterals ?? [];
        for (let i = 0; i < keepLiterals.length; i++) {
            const keep = keepLiterals[i];
            let tmpToken: string;
            do {
                tmpToken = pickRandom_Letters({ count: 10 });
            } while (tmpToken.includes(keep) || keep.includes(tmpToken) || text.includes(tmpToken));

            // replace instances of keep literals with our token
            if (saferText.includes(keep)) {
                tokenToKeepMap[tmpToken] = keep;
                while (saferText.includes(keep)) {
                    saferText = saferText.replace(keep, tmpToken);
                }
            }
        }

        if (replaceMap && Object.keys(replaceMap).length > 0) {
            for (let i = 0; i < Object.keys(replaceMap).length; i++) {
                const toReplace = Object.keys(replaceMap)[i];
                const replaceWith = replaceMap[toReplace];
                while (saferText.includes(toReplace)) {
                    saferText = saferText.replace(toReplace, replaceWith);
                }
            }
        }

        // now remove every non-alphanumeric
        saferText = saferText.replace(/\W/g, '');

        // before checking length, put back in our keep literals (if any)
        const tokens = Object.keys(tokenToKeepMap);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            while (saferText.includes(token)) {
                saferText = saferText.replace(token, tokenToKeepMap[token]);
            }
        }

        // trim the text to length if specified
        if (length && length > 0) {
            // debugger;
            // let resText: string;

            if (saferText.length > length) {
                if (logalot) { console.log(`${lc} curtailing length (I: d7a28e05daa5979c7686b4c1cf519b23)`); }
                saferText = saferText.substring(0, length);
            }
        }

        // replace if text only has characters/nonalphanumerics ("unsafe").
        if (saferText.length === 0) { saferText = ONLY_HAS_NON_ALPHANUMERICS; }

        return saferText;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * picks a random item from an array
 */
export function pickRandom<T extends any>({ x }: { x: T[] }): T | undefined {
    if ((x ?? []).length === 0) { return undefined; /* <<<< returns early */ }
    let randomIndex = Math.floor(Math.random() * x.length);
    return x[randomIndex];
}

/**
 * NOT strong crypto!
 *
 * returns `count` number of letters concatenated into a string.
 */
export function pickRandom_Letters({ count }: { count: number }): string {
    const lc = `${pickRandom_Letters.name}]`;
    try {
        if (!Number.isInteger(count)) { throw new Error(`count required to be a number. (E: c0a21d884ebd9afc4b2e8025207e0522)`); }
        let result: string = "";
        for (let i = 0; i < count; i++) {
            result += pickRandom({ x: 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ') });
        }
        if (result.length !== count) { throw new Error(`${lc} (UNEXPECTED) result.length !== count ? (E: 9bec4ec8f78610d8055e565415392a22)`); }
        return result;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * creates a text selection of the entire element's text.
 *
 * ty https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
 *
 * @param el element whose text we're selecting
 */
export function selectElementText(el: HTMLElement): void {
    const lc = `[${selectElementText.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 0971989c737e5b846894357f671ab322)`); }
        if (((document as any).body).createTextRange) {
            const range = ((document as any).body).createTextRange();
            range.moveToElementText(el);
            range.select();
        } else if (window.getSelection) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                const range = document.createRange();
                range.selectNodeContents(el);
                selection.addRange(range);
            } else {
                throw new Error(`(UNEXPECTED) window.getSelection() returned false? (E: 722b2d3084ed43fe8da22d889ddb52b8)`);
            }
        } else {
            throw new Error(`(UNEXPECTED) cannot select element text? (E: 163a1dd811b4f4bc22dd6823db859322)`);
        }
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * replaces an individual character at a position.
 *
 * ## driving use case
 *
 * part of functionality to replace entire words with underscores (_'s) for blanking out
 * stimulations in wordy robbot.
 *
 * @returns string with replaced characters
 */
export function replaceCharAt({
    s,
    pos,
    newChar,
}: {
    s: string,
    pos: number,
    newChar: string,
}): string {
    const chars = s.split('');
    chars[pos] = newChar;
    return chars.join('');
}

/**
 * Apparently it's a pain to determine if a keyboard event is hitting the
 * "enter" key across platforms.
 *
 * @link https://bugs.chromium.org/p/chromium/issues/detail?id=79407
 * @link https://stackoverflow.com/questions/3883543/javascript-different-keycodes-on-different-browsers
 *
 * @returns true if the event is the user pressing the "Enter" key, else false
 */
export function isKeyboardEvent_Enter(event: KeyboardEvent): boolean {
    const isEnter = event.key === 'Enter' || event.code === 'Enter';
    // event.keyCode === 10 || event.keyCode === 13 ||
    // event.charCode === 10 || event.charCode === 13;
    return isEnter;
}

/**
 * https://github.com/ionic-team/capacitor/issues/1564
 *
 * Still doesn't work...hmm
 */
export function getFileReaderHack(): FileReader {
    const lc = `[${getFileReaderHack.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: d03faf53dd5f1cd1014f2f0e01058b22)`); }
        const fileReader = new FileReader();
        const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
        return zoneOriginalInstance || fileReader;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * checks for mouse/trackball presence and infers keyboard when one is detected.
 *
 * ## aside
 *
 * It's amazing this isn't in an API...
 *
 * @returns true if by magical inference there is probably* a keyboard
 */
export function weHaveAPhysicalKeyboardProbably(): boolean {
    const lc = `${weHaveAPhysicalKeyboardProbably.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 70a952db8e1f23263ba98607def6f422)`); }
        const hasHover = window?.matchMedia?.('(hover:hover)').matches;
        const hasPointerFine = window?.matchMedia?.('(pointer:fine)').matches;
        return hasHover && hasPointerFine;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * Check for either a physical keyboard or a relatively large window
 *
 * ## notes
 *
 * Such a long silly name because it's silly we don't have a better way of
 * detecting this with an official API.
 *
 * @returns true if we think that we're running on mobile
 */
export function weAreRunningOnMobileProbably(): boolean {
    const lc = `${weAreRunningOnMobileProbably.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 5fd8deba6cb8cd40633c69371df95f22)`); }
        const keyboard = weHaveAPhysicalKeyboardProbably();
        const isMightyLargeForMobile = window.innerWidth > 810;
        return keyboard || isMightyLargeForMobile;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * Combines two maps/arrays into a single one with some very basic, naive merge rules:
 *
 * 1. If a key exists in only one map, then it will be included in the output map.
 * 2. If a key exists in both maps and the type is array or map, then these will be recursively merged.
 * 3. If a key exists in both maps but is not an array or map, the dominant map's value wins.
 *
 * ## future
 *
 * In the future, if we want to keep these kinds of things around and be more
 * specific about mergers, we can always rel8 a merge strategy ibgib to be
 * referred to when performing merger.
 */
export function mergeMapsOrArrays_Naive<T extends {} | any[]>({
    dominant,
    recessive,
}: {
    /**
     * when two keys are not arrays or maps themselves, this one's value is
     * chosen for output.
     */
    dominant: T,
    /**
     * when two keys are not arrays or maps themselves, this one's value is NOT
     * chosen for output.
     */
    recessive: T,
}): T {
    const lc = `[${mergeMapsOrArrays_Naive.name}]`;
    try {
        if (Array.isArray(dominant) && Array.isArray(recessive)) {
            // arrays
            const output: any[] = clone(dominant) as any[];
            let warned = false;
            (recessive as []).forEach((recessiveItem: any) => {
                if (typeof (recessiveItem) === 'string') {
                    if (!output.includes(recessiveItem)) { output.push(recessiveItem); }
                } else {
                    if (!warned) {
                        console.warn(`${lc} merging arrays of non-string elements. (W: d8ab113064834abc8eb5fe6c4cf87ba3)`);
                        warned = true;
                    }
                    // we'll check the stringified version of recessive item against
                    // the stringified dominant item.
                    const xString = JSON.stringify(recessiveItem);
                    if (!output.some(o => JSON.stringify(o) === xString)) {
                        output.push(recessiveItem);
                    }
                }
            });
            return (output as T);
        } else if (typeof (dominant) === 'object' && typeof (recessive) === 'object') {
            // maps
            const output: { [key: string]: any } = { ...recessive };
            const dominantKeys: string[] = Object.keys(dominant);
            const recessiveKeys: string[] = Object.keys(recessive);
            dominantKeys.forEach((key: string) => {
                if (recessiveKeys.includes(key)) {

                    // naive merge for key that exists in both dominant & recessive
                    if (Array.isArray((dominant as any)[key]) && Array.isArray((recessive as any)[key])) {
                        // recursive call if both arrays
                        output[key] = mergeMapsOrArrays_Naive<any[]>({
                            dominant: (dominant as any)[key],
                            recessive: (recessive as any)[key],
                        });
                    } else if (
                        !!(dominant as any)[key] && !Array.isArray((dominant as any)[key]) && typeof ((dominant as any)[key]) === 'object' &&
                        !!(recessive as any)[key] && !!Array.isArray((recessive as any)[key]) && typeof ((recessive as any)[key]) === 'object'
                    ) {
                        // recursive call if both objects
                        output[key] = mergeMapsOrArrays_Naive<{}>({
                            dominant: (dominant as any)[key],
                            recessive: (recessive as any)[key],
                        });
                    } else {
                        (output as any)[key] = (dominant as any)[key];
                    }
                } else {
                    output[key] = (dominant as any)[key];
                }
            });

            return output as T;
        } else {
            // ? unknown matching of dominant and recessive
            console.warn(`${lc} unknown values or value types do not match. Both should either be an array or map. Dominant one wins categorically without any merging. (W: 3690ea19b81a4b89b98c1940637df62c)`);
            return (dominant as T);
        }
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    }
};
