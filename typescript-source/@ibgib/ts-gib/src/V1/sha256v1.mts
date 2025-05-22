import { extractErrorMsg } from "@ibgib/helper-gib/dist/helpers/utils-helper.mjs";
import { IbGib_V1, IbGibData_V1, IbGibRel8ns_V1 } from "./types.mjs";
import { Ib } from "../types.mjs";

let crypto: any = globalThis.crypto;
let { subtle } = crypto;

/**
 * Performs the gib hash like V1
 *
 * I have it all in one function for smallest, most independent version possible.
 *
 * #thanks https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 * #thanks https://stackoverflow.com/questions/49129643/how-do-i-merge-an-array-of-uint8arrays
 * #thanks https://stackoverflow.com/a/49129872/3897838 (answer to above)
 *
 * @param ibGib ibGib for which to calculate the gib
 */
export function sha256v1_old(ibGib: IbGib_V1, salt: string = ""): Promise<string> {
    // console.log('func_gib_sha256v1 executed');
    if (!salt) { salt = ""; }
    let hashToHex = async (message: string | undefined) => {
        if (!message) { return ""; }
        const msgUint8 = new TextEncoder().encode(message);
        const buffer = await subtle.digest('SHA-256', msgUint8);
        const asArray = Array.from(new Uint8Array(buffer));
        // return hashAsHex
        return asArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    let hashToHex_Uint8Array = async (salt: string, msgUint8: Uint8Array) => {
        let tohashUint8Array: Uint8Array;
        if (salt) {
            const msgUint8_salt = new TextEncoder().encode(salt);
            tohashUint8Array = new Uint8Array(msgUint8_salt.length + msgUint8.length);
            tohashUint8Array.set(msgUint8_salt);
            tohashUint8Array.set(msgUint8, msgUint8_salt.length);
        } else {
            tohashUint8Array = msgUint8;
        }
        const hashAsBuffer = await subtle.digest('SHA-256', tohashUint8Array);
        const hashAsArray = Array.from(new Uint8Array(hashAsBuffer));
        // return hashAsHex
        return hashAsArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    let hashFields;
    if (salt) {
        hashFields = async (ib: Ib, data: IbGibData_V1 | undefined, rel8ns: IbGibRel8ns_V1 | undefined) => {
            const hasRel8ns =
                Object.keys(rel8ns || {}).length > 0 &&
                Object.keys(rel8ns || {}).some(k => rel8ns![k] && rel8ns![k]!.length > 0);
            let hasData = !!data;
            if (hasData) {
                if (typeof data === 'string') {
                    hasData = (data as string).length > 0;
                } else if (data instanceof Uint8Array) {
                    hasData = true;
                } else if (typeof data === 'object') {
                    hasData = Object.keys((data) || {}).length > 0;
                } else {
                    hasData = true;
                }
            }
            const ibHash = (await hashToHex(salt + ib)).toUpperCase();
            // empty, null, undefined all treated the same at this level.
            const rel8nsHash: string = hasRel8ns ? (await hashToHex(salt + JSON.stringify(rel8ns))).toUpperCase() : "";
            // empty, null, undefined all treated the same at this level (though not farther down in data)

            // change this for binaries (Uint8Array data)
            // const dataHash: string = hasData ? (await hashToHex(salt + JSON.stringify(data))).toUpperCase() : "";
            let dataHash: string = "";
            if (hasData) {
                if (data instanceof Uint8Array) {
                    dataHash = (await hashToHex_Uint8Array(salt, data)).toUpperCase();
                } else {
                    dataHash = (await hashToHex(salt + JSON.stringify(data))).toUpperCase();
                }
            }

            // if the ibgib has no rel8ns or data, the hash should be just of the ib itself.
            const allHash = hasRel8ns || hasData ?
                (await hashToHex(salt + ibHash + rel8nsHash + dataHash)).toUpperCase() :
                (await hashToHex(salt + ibHash)).toUpperCase();
            return allHash;
        };
    } else {
        hashFields = async (ib: Ib, data: IbGibData_V1 | undefined, rel8ns: IbGibRel8ns_V1 | undefined) => {
            const hasRel8ns =
                Object.keys(rel8ns || {}).length > 0 &&
                Object.keys(rel8ns || {}).some(k => rel8ns![k] && rel8ns![k]!.length > 0);
            // const hasData = Object.keys((data) || {}).length > 0;
            let hasData = !!data;
            if (hasData) {
                if (typeof data === 'string') {
                    hasData = (data as string).length > 0;
                } else if (data instanceof Uint8Array) {
                    hasData = true;
                } else if (typeof data === 'object') {
                    hasData = Object.keys((data) || {}).length > 0;
                } else {
                    hasData = true;
                }
            }
            const ibHash = (await hashToHex(ib)).toUpperCase();
            // empty, null, undefined all treated the same at this level.
            const rel8nsHash: string = hasRel8ns ? (await hashToHex(JSON.stringify(rel8ns))).toUpperCase() : "";
            // empty, null, undefined all treated the same at this level (though not farther down in data)
            // const dataHash: string = hasData ? (await hashToHex(JSON.stringify(data))).toUpperCase() : "";
            let dataHash: string = "";
            if (hasData) {
                if (data instanceof Uint8Array) {
                    dataHash = (await hashToHex_Uint8Array('', data)).toUpperCase();
                } else {
                    dataHash = (await hashToHex(JSON.stringify(data))).toUpperCase();
                }
            }
            // if the ibgib has no rel8ns or data, the hash should be just of the ib itself.
            const allHash = hasRel8ns || hasData ?
                (await hashToHex(ibHash + rel8nsHash + dataHash)).toUpperCase() :
                (await hashToHex(ibHash)).toUpperCase();
            return allHash;
        }
    }
    return hashFields(ibGib.ib, ibGib?.data, ibGib?.rel8ns);
}

export function sha256v1(ibGib: IbGib_V1, salt: string = ""): Promise<string> {
    // console.log('func_gib_sha256v1 executed');
    if (!salt) { salt = ""; }
    let hashToHex = async (message: string | undefined) => {
        if (!message) { return ""; }
        const msgUint8 = new TextEncoder().encode(message);
        const buffer = await subtle.digest('SHA-256', msgUint8);
        const asArray = Array.from(new Uint8Array(buffer));
        // return hashAsHex
        return asArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    let hashToHex_Uint8Array = async (salt: string, msgUint8: Uint8Array) => {
        let tohashUint8Array: Uint8Array;
        if (salt) {
            const msgUint8_salt = new TextEncoder().encode(salt);
            tohashUint8Array = new Uint8Array(msgUint8_salt.length + msgUint8.length);
            tohashUint8Array.set(msgUint8_salt);
            tohashUint8Array.set(msgUint8, msgUint8_salt.length);
        } else {
            tohashUint8Array = msgUint8;
        }
        const hashAsBuffer = await subtle.digest('SHA-256', tohashUint8Array);
        const hashAsArray = Array.from(new Uint8Array(hashAsBuffer));
        // return hashAsHex
        return hashAsArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    /**
     * normalizes via sorting keys and removing values that are undefined.
     * values that are null or empty strings are not removed.
     *
     * this is DUPLICATED code in the respec file. any changes here must
     * manually be changed in the respec file!!!
     *
     * @param obj to normalize (is not changed, e.g. keys aren't sorted in place)
     */
    const toNormalizedForHashing = (obj: any) => {
        if (!obj) {
            return obj; /* <<<< returns early */
        } else if (typeof obj === 'string' || Array.isArray(obj)) {
            return obj.concat(); /* <<<< returns early */
        } else if (typeof obj !== 'object') {
            // Return non-objects as is, we don't know how to concat/copy it...hmm...
            return obj;  /* <<<< returns early */
        }

        // we have an object. we will create a new object and populate it.
        const normalized = {};

        // sort keys alphabetically
        // NOTE: this does NOT mutate obj as Object.keys produces a new array
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
            const value = obj[key];
            if (value !== undefined) {
                // Recursively normalize if the value is an object
                normalized[key] = (typeof value === 'object' && value !== null) ? toNormalizedForHashing(value) : value;
            }
        }
        return normalized;
    }

    let hashFields;
    if (salt) {
        hashFields = async (ib: Ib, data: IbGibData_V1 | undefined, rel8ns: IbGibRel8ns_V1 | undefined) => {
            const hasRel8ns =
                Object.keys(rel8ns || {}).length > 0 &&
                Object.keys(rel8ns || {}).some(k => rel8ns![k] && rel8ns![k]!.length > 0);
            let hasData = !!data;
            if (hasData) {
                if (typeof data === 'string') {
                    hasData = (data as string).length > 0;
                } else if (data instanceof Uint8Array) {
                    hasData = true;
                } else if (typeof data === 'object') {
                    hasData = Object.keys((data) || {}).length > 0;
                } else {
                    hasData = true;
                }
            }
            const ibHash = (await hashToHex(salt + ib)).toUpperCase();
            // empty, null, undefined all treated the same at this level.
            const rel8nsHash: string = hasRel8ns ? (await hashToHex(salt + JSON.stringify(toNormalizedForHashing(rel8ns)))).toUpperCase() : "";
            // empty, null, undefined all treated the same at this level (though not farther down in data)

            // change this for binaries (Uint8Array data)
            // const dataHash: string = hasData ? (await hashToHex(salt + JSON.stringify(data))).toUpperCase() : "";
            let dataHash: string = "";
            if (hasData) {
                if (data instanceof Uint8Array) {
                    dataHash = (await hashToHex_Uint8Array(salt, data)).toUpperCase();
                } else {
                    dataHash = (await hashToHex(salt + JSON.stringify(toNormalizedForHashing(data)))).toUpperCase();
                }
            }

            // if the ibgib has no rel8ns or data, the hash should be just of the ib itself.
            const allHash = hasRel8ns || hasData ?
                (await hashToHex(salt + ibHash + rel8nsHash + dataHash)).toUpperCase() :
                (await hashToHex(salt + ibHash)).toUpperCase();
            return allHash;
        };
    } else {
        hashFields = async (ib: Ib, data: IbGibData_V1 | undefined, rel8ns: IbGibRel8ns_V1 | undefined) => {
            const hasRel8ns =
                Object.keys(rel8ns || {}).length > 0 &&
                Object.keys(rel8ns || {}).some(k => rel8ns![k] && rel8ns![k]!.length > 0);
            // const hasData = Object.keys((data) || {}).length > 0;
            let hasData = !!data;
            if (hasData) {
                if (typeof data === 'string') {
                    hasData = (data as string).length > 0;
                } else if (data instanceof Uint8Array) {
                    hasData = true;
                } else if (typeof data === 'object') {
                    hasData = Object.keys((data) || {}).length > 0;
                } else {
                    hasData = true;
                }
            }
            const ibHash = (await hashToHex(ib)).toUpperCase();
            // empty, null, undefined all treated the same at this level.
            const rel8nsHash: string = hasRel8ns ? (await hashToHex(JSON.stringify(toNormalizedForHashing(rel8ns)))).toUpperCase() : "";
            // empty, null, undefined all treated the same at this level (though not farther down in data)
            // const dataHash: string = hasData ? (await hashToHex(JSON.stringify(data))).toUpperCase() : "";
            let dataHash: string = "";
            if (hasData) {
                if (data instanceof Uint8Array) {
                    dataHash = (await hashToHex_Uint8Array('', data)).toUpperCase();
                } else {
                    dataHash = (await hashToHex(JSON.stringify(toNormalizedForHashing(data)))).toUpperCase();
                }
            }
            // if the ibgib has no rel8ns or data, the hash should be just of the ib itself.
            const allHash = hasRel8ns || hasData ?
                (await hashToHex(ibHash + rel8nsHash + dataHash)).toUpperCase() :
                (await hashToHex(ibHash)).toUpperCase();
            return allHash;
        }
    }
    return hashFields(ibGib.ib, ibGib?.data, ibGib?.rel8ns); // conditional nav ibGib?.data and ibGib?.rel8ns
}

/**
 * I have one large-ish sha256 function for gibbing purposes
 * (dream where metabootstrapping is better)
 * this is just testing a function that is internal to the sha256v1 func.
 * terrible as can be duplicated, but simple for now.
 */
export async function hashToHexCopy(
    message: string | undefined
): Promise<string | undefined> {
    if (!message) { return ""; }
    try {
        const msgUint8 = new TextEncoder().encode(message);
        const buffer = await subtle.digest('SHA-256', msgUint8);
        const asArray = Array.from(new Uint8Array(buffer));
        return asArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.error(extractErrorMsg(e.message));
        return undefined;
    }
};
