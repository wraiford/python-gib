import { Ib, Gib, IbGib, IbGibAddr, IbAndGib } from './types.mjs';


/**
 * Gets the ib^gib address from the given ib and gib or
 * from the ibGib object.
 *
 * Need to refactor to getIbGibAddr
 */
export function getIbGibAddr({
    ib, gib, ibGib, delimiter = '^'
}: {
    ib?: Ib,
    gib?: Gib,
    ibGib?: IbGib,
    delimiter?: string
}): IbGibAddr {
    ib = ib || ibGib?.ib || '';
    gib = gib || ibGib?.gib || '';
    return ib + delimiter + gib;
}

/**
 * Get the ib and gib fields from an ibGib object or ibGibAddr
 * with the given `delimiter`.
 */
export function getIbAndGib({
    ibGib,
    ibGibAddr,
    delimiter = '^'
}: {
    ibGibAddr?: IbGibAddr,
    ibGib?: IbGib,
    delimiter?: string
}): IbAndGib {
    const lc = '[getIbAndGib]';
    if (!ibGibAddr) {
        if (ibGib) {
            ibGibAddr = getIbGibAddr({ ibGib });
        } else {
            throw new Error(`${lc} We need either an address or an ibGib object`);
        }
    }
    if (!ibGibAddr) { throw new Error(`${lc} Couldn't get ibGibAddr. ibGib invalid?`); }

    if (!delimiter) { delimiter = '^'; }

    const pieces = ibGibAddr.split(delimiter);
    if (pieces.length === 2) {
        // normal v1 case, e.g. 'ib^gib' or 'tag home^ABC123'
        return { ib: pieces[0], gib: pieces[1] };
    } else if (pieces.length === 1 && ibGibAddr.endsWith(delimiter)) {
        // normal v1 primitive, e.g. '7^' or 'name^'
        return { ib: pieces[0], gib: '' };
    } else if (pieces.length === 1 && ibGibAddr.startsWith(delimiter)) {
        // only gib/hash is provided like maybe a binary file
        // e.g. ^ABC123 or ^XYZ456 or ^some_gib_that_isnt_a_hash
        return { ib: '', gib: pieces[0] };
    } else if (pieces.length === 2 && pieces[0] === '' && pieces[1] === '') {
        // edge case of address is only the delimiter.
        // So it's the primitive for that delimiter
        return { ib: delimiter, gib: '' };
        // } else if (pieces.length === 0 ) {
        // ibGibAddr is falsy, so would have thrown earlier in this function
        // I'm just noting this case for intent ATOW
    } else {
        console.warn(`${lc} multiple delimiters found in ibGibAddr. Considering last delimiter as the demarcation of gib hash`);
        // e.g. 'ib^ABC123^gib'
        // ib: 'ib^ABC123'
        // gib: 'gib'
        return {
            ib: pieces.slice(0, pieces.length - 1).join(delimiter),
            gib: pieces.slice(pieces.length - 1)[0],
        }
    }
}

/**
 * normalizes via sorting keys and removing values that are undefined.
 * values that are null or empty strings are not removed.
 *
 * this is DUPLICATED code in the respec file. any changes here must
 * manually be changed in the respec file!!!
 *
 * @param obj to normalize (is not changed, e.g. keys aren't sorted in place)
 */
export function toNormalizedForHashing(obj: any): any {
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
