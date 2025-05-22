import {
    HEXADECIMAL_HASH_STRING_REGEXP_32, HEXADECIMAL_HASH_STRING_REGEXP_64,
} from '@ibgib/helper-gib/dist/constants.mjs';
import { extractErrorMsg } from '@ibgib/helper-gib/dist/helpers/utils-helper.mjs';

import { Ib, IbGibAddr, } from '../types.mjs';
import { IbGibRel8ns_V1, IbGib_V1, } from './types.mjs';
import { IBGIB_DELIMITER, GIB, IB, GIB_DELIMITER, } from './constants.mjs';
import { isPrimitive, getGib, getGibInfo } from './transforms/transform-helper.mjs';
import { hasTjp, toDto } from './v1-helper.mjs';
import { getIbAndGib, getIbGibAddr } from '../helper.mjs';

const logalot = false;

/**
 * validates the ibGib's address (`ib` and `gib` properties) and recalculates
 * the `gib` against the `ibGib.gib`.
 *
 * this validates not only that the punctiliar gib hash for this ibgib record
 * hashes to the same value, but it also checks the internal tjp address and
 * ensures that it is the same tjp gib in the gib field.
 *
 * ## notes
 *
 * * By checking the tjp gib is the same in the address as in the tjp rel8n, we
 *   are providing (extremely?) good corroboration that the tjp listed in the
 *   address is accurate. However, it may still be theoretically possible to
 *   forge an ibgib that both hashes to the punctiliar hash and matches up this
 *   tjpAddr.gib. This would be AFAICT quite challenging.
 */
export async function validateIbGibIntrinsically({
    ibGib
}: {
    ibGib: IbGib_V1
}): Promise<string[] | null> {
    const lc = `[${validateIbGibIntrinsically.name}]`;
    try {
        let errors: string[] = [];
        if (ibGib) {
            const addr = getIbGibAddr({ ibGib });
            errors = validateIbGibAddr({ addr }) ?? [];

            if (errors.length > 0) {
                console.error(`${lc} errors found in addr: ${addr}`);
                return errors; // <<<< returns early
            }

            // rest of the function assumes correctly formatted ib and gib

            // if it's a primitive, the caller knows (or should know!) there are no
            // metadata guarantees.
            if (isPrimitive({ gib: ibGib.gib })) { return null; }

            // this validates not only that the punctiliar gib hash for this ibgib record
            // hashes to the same value, but it also checks the internal tjp address and
            // ensures that it is the same tjp gib.
            // not necessary the dto here, but I'm sensitive at this point.
            let gottenGib = await getGib({ ibGib: toDto({ ibGib }), hasTjp: hasTjp({ ibGib }) });
            if (gottenGib !== ibGib.gib) {
                if (ibGib.data?.src && ibGib.data.srcAddr && ibGib.ib === 'rel8') {
                    // this is NOT the place to do this, but I'm plodding through trying to think of how to fix it
                    // this is what it looks like in data
                    // {
                    //     "rel8nsToAddByAddr":{
                    //         "comment":["comment 11221^F6B9477984D31FEF5FD25297CA39126A64ADDE2C91C1A2D670CCFE3965DEC4C9.847F0E9A1B2738DC167B32AA9B2D7D9B88B76F21848B1F193E994BB21F90DAEE"]
                    //     },
                    //     "dna":true,
                    //     "nCounter":true,
                    //     "type":"rel8"
                    // }
                    delete ibGib.data.src;
                    delete ibGib.data.srcAddr;
                    gottenGib = await getGib({ ibGib: toDto({ ibGib }), hasTjp: hasTjp({ ibGib }) });
                    if (gottenGib !== ibGib.gib) {
                        errors.push(`Ibgib invalid intrinsically - gottenGib (${gottenGib}) does not equal ibGib.gib (${ibGib.gib}). (E: 020b71479e944b2198fe436e7e137786)`);
                        // } else {
                        //     debugger;
                    }
                } else {
                    errors.push(`Ibgib invalid intrinsically - gottenGib (${gottenGib}) does not equal ibGib.gib (${ibGib.gib}). (E: 7416db016878430ca3c5b20697f164ed)`);
                }
            }

            return errors.length > 0 ? errors : null;
        } else {
            errors.push(`ibGib is itself falsy. (E: 4fb98caf6ed24ef7b35a19cef56e2d7e)`);
            return errors;
        }

    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }
}

/**
 * Naive synchronous validation for ibgib addresses.
 *
 * @returns error string array if validation errors found, else null
 */
export function validateIbGibAddr({
    addr,
    delimiter,
    version,
}: {
    addr: IbGibAddr,
    delimiter?: string,
    version?: string,
}): string[] | null {
    const lc = `[${validateIbGibAddr.name}]`;
    try {
        let errors: string[] = [];
        if (version) { console.warn(`${lc} version not implemented yet. Ignoring. (W: 2d19db16ec0c4766b5d35248787671f3)`); }

        // validate as a whole
        if (!addr) {
            errors.push(`addr required. (E: e9a54041aa0b41c1bb2324d9d2d42c7f)`);
            return errors;
        }
        delimiter = delimiter || IBGIB_DELIMITER;
        if (!addr.includes(delimiter)) { errors.push(`No delimiter (${delimiter}) found. (E: 05e28dcb70ff44019edc53ed508bd1e8)`); }
        if (addr.startsWith(delimiter)) { errors.push(`addr starts with delim. (E: d29f808c5a47452f9bb3ea684694c6eb)`); }

        // validate pieces...
        const { ib, gib } = getIbAndGib({ ibGibAddr: addr, delimiter });

        // ...ib
        const resValidateIb = validateIb({ ib, ibGibAddrDelimiter: delimiter, version });
        if (resValidateIb) { errors = errors.concat(resValidateIb); }

        // ...gib
        const resValidateGib = validateGib({ gib, ibGibAddrDelimiter: delimiter, version });
        if (resValidateGib) { errors = errors.concat(resValidateGib); }

        if (errors.length > 0) {
            if (logalot) { console.log(`${lc} errors.length > 0. errors: ${errors.join('|')} (I: 9c18f993e138f15613e4c6a340d41722)`); }
        }

        // we're done
        return errors.length > 0 ? errors : null;
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }
}

/**
 * Naive validation of ib.
 *
 * @returns errors array if found, else null
 */
export function validateIb({
    ib,
    ibGibAddrDelimiter,
    version,
}: {
    ib: Ib,
    ibGibAddrDelimiter?: string,
    version?: string,
}): string[] | null {
    const lc = `[${validateIb.name}]`;
    try {
        const errors: string[] = [];
        if (version) { console.warn(`${lc} version not implemented yet. Ignoring. (W: 71228ba4ed994aaa8149910e295ab087)`); }

        if (!ib) {
            errors.push(`ib required. (E: a76d06c7b9c24db3a731a91dbe46acd5)`);
            return errors;
        }

        if (ib === IB) { return null; }

        ibGibAddrDelimiter = ibGibAddrDelimiter || IBGIB_DELIMITER;
        if (ib.includes(ibGibAddrDelimiter)) { errors.push(`ib contains ibGibAddrDelimiter (${ibGibAddrDelimiter}) (E: 09e61b46c3e84874bc02b6918f1f2c39)`); }

        return errors.length > 0 ? errors : null;
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }
}

/**
 * validates a `gib` of some ibGib/ibGibAddr.
 *
 * @returns array of validation error strings (if any) or null
 */
export function validateGib({
    gib,
    gibDelimiter,
    ibGibAddrDelimiter,
    version,
}: {
    /**
     * gib to validate.
     *
     * ## notes
     *
     * If the gib has a tjp embedded in it (i.e. the associated ibgib has a
     * tjp), then this will call validation on that tjpGib recursively.
     */
    gib: Ib,
    /**
     * This is a delimiter used with tjpGibs.
     *
     * atow this is a dot (`'.'`).
     *
     * ## notes
     *
     * THIS IS NOT THE SAME THING AS THE `ibGibAddrDelimiter`!
     */
    gibDelimiter?: string,
    /**
     * This is a delimiter used with the entire ibGibAddr.
     *
     * atow this is a caret (`'^'`).
     *
     * ## notes
     *
     * THIS IS NOT THE SAME THING AS THE `gibDelimiter`!
     */
    ibGibAddrDelimiter?: string,
    /**
     * Ignored atow, but in the future, probably will be used.
     * May end up being an IbGibAddr but who knows.
     */
    version?: string,
}): string[] | null {
    const lc = `[${validateGib.name}]`;
    try {
        const errors: string[] = [];
        if (version) { console.warn(`${lc} version not implemented yet. Ignoring. (E: 90ced1db69774702b92acb261bdaee23)`); }

        if (!gib) {
            errors.push(`gib required. (E: e217de4035b04086827199f4bace189c)`);
            return errors;
        }

        ibGibAddrDelimiter = ibGibAddrDelimiter || IBGIB_DELIMITER;
        /** Need to move this to ts-gib */
        const INVALID_GIB_CHARS = [ibGibAddrDelimiter];
        const invalidCharsFound: string[] = [];
        INVALID_GIB_CHARS.forEach(invalidChar => {
            if (gib.includes(invalidChar)) { invalidCharsFound.push(invalidChar); }
        });
        if (invalidCharsFound.length > 0) {
            errors.push(`gib (${gib}}) contains invalid characters: (${JSON.stringify(invalidCharsFound.join(','))}) (E: 1e584258d9e049ba9ce7e516f3ab97f1)`);
        }

        // punctiliar = point, i.e., a single point in the universe, either a
        // single point in time in a tjp ibgib's timeline, or a single point in
        // space that lives outside of time (has no tjp thus no timeline).
        //
        // So if we've gotten here in code, then our gib is truthy and doesn't
        // contain invalid characters.

        const { punctiliarHash, tjpGib, isPrimitive } =
            getGibInfo({ gib, gibDelimiter: gibDelimiter || GIB_DELIMITER });

        // automatically valid if it's a primitive, as the caller should expect
        // no cryptographical guarantees
        if (isPrimitive) { return null; }

        // Gib is not primitive so must have at least the punctiliar hash.
        if (!punctiliarHash) { throw new Error(`${lc} punctiliarHash is falsy on a non-primitive gib. (E: 72835394918241bdb2632bf0510bdae5)`); }
        const punctiliarHashIs_32 = punctiliarHash!.match(HEXADECIMAL_HASH_STRING_REGEXP_32);
        const punctiliarHashIs_64 = punctiliarHash!.match(HEXADECIMAL_HASH_STRING_REGEXP_64);
        if (!punctiliarHashIs_32 && !punctiliarHashIs_64) {
            errors.push('gib punctiliar hash is neither a 32- or 64-char hash string. (E: d47ff6d6e14b4c02a62107090c8dad39)');
        }

        if (tjpGib) {
            // if it is an ibgib in a timeline, that timeline has a tjp and this
            // gib has a tjpGib component. So we must recursively validate the
            // tjpGib
            const tjpGibValidationErrors = validateGib({ gib: tjpGib });
            if ((tjpGibValidationErrors ?? []).length > 0) {
                errors.push(`tjpGib has errors (E: d6b79228d4a64c0b967cdb0efcea4d0d). tjpGibValidationErrors: ${tjpGibValidationErrors!.join('. ')}`);
            }
        }

        return errors.length > 0 ? errors : null;
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }
}

/**
 * verifies that
 * @param param0
 * @returns
 */
export function validateRel8nsIntrinsically({
    rel8ns,
}: {
    rel8ns: IbGibRel8ns_V1,
}): string[] | null {
    const lc = `[${validateRel8nsIntrinsically.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 62b4722599798dd8ab95fcebf42c0e23)`); }

        let errors: string[] = [];

        const rel8nNames = Object.keys(rel8ns);
        for (let i = 0; i < rel8nNames.length; i++) {
            // all rel8nNames/keys are strings
            const rel8nName = Object.keys(rel8ns)[i];
            if (typeof rel8nName !== 'string') {
                errors.push(`non-string rel8nName found. all keys of rel8ns must be of type string. (E: 3b2e4582b638421681951f5475c85178)`)
            }

            // all values are ibgib addr arrays
            const addrs = rel8ns[rel8nName] ?? [];
            for (let j = 0; j < addrs.length; j++) {
                const addr = addrs[j];
                const addrErrors = validateIbGibAddr({ addr }) ?? [];
                if (addrErrors.length > 0) {
                    errors.push(`invalid addr found for rel8nName (${rel8nName}). addr errors: ${addrErrors.join('|')} (E: 56809a746c4f462db426e90395b80364)`);
                }
            }
        }
        return errors.length > 0 ? errors : null;
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}
