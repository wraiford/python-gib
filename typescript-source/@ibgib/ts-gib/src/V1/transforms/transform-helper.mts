import { clone, extractErrorMsg, } from "@ibgib/helper-gib/dist/helpers/utils-helper.mjs";
import { TransformOpts, IbGib, Gib, IbGibAddr, } from "../../types.mjs";
import { getIbGibAddr, getIbAndGib, } from "../../helper.mjs";
import { sha256v1, } from "../sha256v1.mjs";
import { GibInfo, IbGib_V1, } from "../types.mjs";
import { IBGIB_DELIMITER, GIB, GIB_DELIMITER } from "../constants.mjs";

export async function buildDna<TSrc extends IbGib_V1, TOpts extends TransformOpts<TSrc>>(
    opts: TOpts,
): Promise<IbGib_V1> {
    const transformData: TOpts = clone(opts);
    let lc = `[${buildDna.name}]`;

    // remove references to the srcAddr, as this will be captured
    // by the ibGib's `past` rel8n. This way, we can reapply dna
    // to different src's more easily, as well as have less unique dna
    if (transformData.srcAddr) { delete transformData.srcAddr; }

    // remove all references to actual objects in this, we just
    // want the data. ATOW, src is a reference to the src object
    // and we only want the srcAddr
    delete transformData.src;

    // dna is never timestamped or uniquely identified hmm...
    // or rel8d to anything...hmmm
    // so much dna, best to minimize though of course we dont
    // want to prematurely optimize...but there's a looooot of dna.
    // best to share/reuse as much as possible.
    const result: IbGib_V1 = {
        ib: transformData.type!,
        data: transformData,
        rel8ns: {
            ancestor: [
                `${transformData.type!.toString()}${IBGIB_DELIMITER}${GIB}` // e.g. fork^gib
            ]
        }
    };

    result.gib = await sha256v1(result);

    return result;
}

export function isDna({ ibGib }: { ibGib: IbGib }): boolean {
    const lc = `[${isDna.name}]`;
    try {
        if (!ibGib) { throw new Error(`ibGib required.`); }

        // console.log(`${lc} ibGib: ${pretty(ibGib)}`);

        // ancestor is known transform is the best way for v1 ATOW
        const knownTransformPrimitiveAddrs =
            ['fork', 'mut8', 'rel8', 'plan'].map(x => `${x}^${GIB}`); // plan from prev versions
        const hasTransformAncestor =
            ((ibGib as any).rel8ns) &&
            ((ibGib as any).rel8ns.ancestor) &&
            (Array.isArray((ibGib as any).rel8ns.ancestor)) &&
            ((((ibGib as any).rel8ns.ancestor) as any) as any).
                some((x: any) => knownTransformPrimitiveAddrs.includes(x));

        return hasTransformAncestor || false;
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }
}

export function isPrimitive({ ibGib, gib }: { ibGib?: IbGib_V1, gib?: Gib }): boolean {
    if (ibGib) {
        return isPrimitive({ gib: ibGib.gib });
    } else if (gib) {
        return gib === GIB;
    } else {
        // falsy gib means it's primitive or a programming error...hmm
        return true;
    }
}

/**
 * Generates the gib of a given `ibGib` depending on
 * @returns gib - either bare hash for those with no tjp; or tjp-scoped hash; or 'gib' for primitives
 */
export async function getGib({
    ibGib,
    hasTjp,
    tjpAddr,
    gibDelimiter,
    isPrimitive,
    hashAlgorithm,
}: {
    /**
     * We'll take the `ib`, `data`, and `rel8ns` from this
     */
    ibGib: IbGib_V1,
    /**
     * If true, then we'll treat this as having a tjp.
     * If falsy, then we'll check the internals of the ibGib to see if it has a tjp.
     */
    hasTjp?: boolean;
    /**
     * @deprecated
     *
     * IGNORED
     *
     * This is now always searched for in the ibGib itself.
     */
    tjpAddr?: IbGibAddr,
    /**
     * What to use as the delimiter for the `gib`.
     *
     * @default GIB_DELIMITER
     *
     * ## notes
     *
     * This is not the same thing necessarily as the ib^gib delimiter.
     * In fact the default gibDelimiter ATOW ('.') is different than the
     * default ib^gib delimiter ('^').
     */
    gibDelimiter?: string,
    /**
     * If this is primitive, then the `gib` is always GIB ("gib" string literal).
     */
    isPrimitive?: boolean,
    /**
     * Hash algorithm to use when calculating the gib hash of the ibgib datum.
     *
     * ## notes
     *
     * * I'm just including this now to show where we will expand when working with
     *   multiple hash algorithms. For now though, in all of V1, we use 'SHA-256'
     *   when calculating the gib hashes. This is why I'm hard-coding the type
     *   here instead of using this lib's `HashAlgorithm` type.
     *   * This param is actually ignored ATOW.
     * * In my current consuming use case (ionic-gib), though,
     *   I am indeed using SHA-512 when encrypting using encrypt-gib. I only note
     *   this in case someone sees "SHA-512" code somewhere and is confused.
     */
    hashAlgorithm?: 'SHA-256',
}): Promise<string> {
    const lc = `[${getGib.name}]`;
    try {
        if (!ibGib) { throw new Error(`ibGib required. (E: 17d073226b9d42fd841e5a94b065ef21)`); }
        if (isPrimitive) { return GIB; }
        const ibGibHash = await sha256v1(ibGib, '');
        const rel8ns = ibGib.rel8ns ?? {};
        const data = ibGib.data ?? {};
        gibDelimiter = gibDelimiter || GIB_DELIMITER;
        if (!hasTjp) { hasTjp = (rel8ns.tjp ?? []).length > 0 || data.isTjp || false; }
        if (hasTjp) {
            let tjpAddrGib: string | undefined;
            if (rel8ns.tjp) {
                if (rel8ns.tjp.length === 1) {
                    if (rel8ns.tjp[0]) { // checking for empty string
                        tjpAddr = rel8ns.tjp[0];
                    } else {
                        throw new Error(`rel8ns.tjp[0] is falsy. (E: ed879d2b039543f8b1902e8b7b5a5a7b)`);
                    }
                } else if (rel8ns.tjp.length > 1) {
                    if (rel8ns.tjp[rel8ns.tjp.length - 1]) {
                        console.warn(`${lc} found more than one tjp addr...only expecting 1 ATOW. (W: 10ed43f716e743e0afd1954f1ab46789)`);
                        tjpAddr = rel8ns.tjp[rel8ns.tjp.length - 1];
                    } else {
                        throw new Error(`multiple tjp addrs, and the last (most recent) one is falsy. (E: bc835dc89be24075bba8b2b6616ea069)`);
                    }
                } else {
                    // empty rel8ns.tjp array?
                    throw new Error(`hasTjp is true but rel8ns.tjp is empty array. (E: d08b2f9e86494814b5e7d7b4602b2ab7)`);
                }
            } else if (data.isTjp) {
                // the ibGib itself is the tjp
                tjpAddr = getIbGibAddr({ ib: ibGib.ib, gib: ibGibHash });
            } else {
                throw new Error(`hasTjp is true, but both ibGib.rel8ns.tjp and ibGib.data.isTjp are falsy. (E: 4e246897e52044789594d853bb5b66ee)`)
            }
            tjpAddrGib = tjpAddr ? getIbAndGib({ ibGibAddr: tjpAddr }).gib : undefined;

            if (tjpAddrGib) {
                // if the ibGib IS the tjp, then the gib is only the hash

                // if the ibGib is NOT the tjp, then the gib is the hash plus
                // tjpGib. note in the future, if multiple tjps are going, then
                // tjpAddrGib itself may have another delim inside it, so we
                // will end up with a gib with multiple delimiters.
                return data.isTjp ? ibGibHash : `${ibGibHash}${GIB_DELIMITER}${tjpAddrGib}`;
            } else {
                throw new Error(`hasTjp is true but could not find tjpAddrGib. (E: 1863df626b754744a1d431a683cb0ba0)`);
            }
        } else {
            // no tjp, so gib is just the hash
            return ibGibHash;
        }
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }

}

/**
 * Parses gib (either via `gib` param or `ibGibAddr.gib`) and returns information
 * about it.
 *
 * @returns Information about the given `gib` (or `gib` extracted from `ibGibAddr`)
 */
export function getGibInfo({
    ibGibAddr,
    gib,
    gibDelimiter,
}: {
    /**
     * If given, will extract `gib` from this.
     */
    ibGibAddr?: IbGibAddr,
    /**
     * `gib` to analyze.
     */
    gib?: Gib,
    /**
     * Delimiter among pieces of gib, if applicable.
     *
     * @default GIB_DELIMITER (ATOW '.')
     *
     * ## notes
     *
     * Some `gib` values will include tjp information, while others
     * are just the hash.
     */
    gibDelimiter?: string,
}): GibInfo {
    const lc = `[${getGibInfo.name}]`;
    try {
        if (!ibGibAddr && !gib) { throw new Error(`Either ibGibAddr or gib required. (E: 25e3dcbe63cd44909032df12af9df75e)`); }
        gib = gib || getIbAndGib({ ibGibAddr }).gib;

        if (gib === GIB) { return { isPrimitive: true } }

        gibDelimiter = gibDelimiter ?? GIB_DELIMITER;

        if (gib.includes(gibDelimiter)) {
            const pieces = gib.split(gibDelimiter);
            if (pieces.some(p => p === '')) { throw new Error(`unexpected gib that contains gibDelimiter (${gibDelimiter}) but has at least one piece with empty string. (E: 75a94280045541009ee68182d12d3449)`); }

            const piecesCount = pieces.length;
            if (piecesCount > 2) { console.warn(`${lc} gib only expected to have two pieces ATOW. re-examine please. (W: aa4283ac5a5747a386a69966ecdad39d)`); }

            const punctiliarHashPiece = pieces.splice(0, 1);
            return {
                punctiliarHash: punctiliarHashPiece[0],
                tjpGib: pieces.join(gibDelimiter), // after splice, piece/s is/are tjp
                piecesCount,
                delimiter: gibDelimiter,
            }
        } else {
            return {
                punctiliarHash: gib,
                piecesCount: 1,
                delimiter: gibDelimiter,
            }
        }
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }
}
