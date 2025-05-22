import { IbGib_V1 } from './types.mjs';

/**
 * This is essentially an alias of the string literal `'ib'`
 */
export const IB = 'ib';
/**
 * This is essentially an alias of the string literal `'gib'`
 *
 * When you have a primitive ibgib, this should be the `ibGib.gib` value, as
 * there is no hashing metadata for primitives.
 */
export const GIB = 'gib';
/**
 * This is the root ibgib from which all ibgib are ultimately forked.
 * It has 0 and infinite data, 0 and infinite rel8ns. Its ib and gib
 * are simply 'ib' and 'gib'.
 */
export const ROOT: IbGib_V1 = { ib: IB, gib: GIB, }
/**
 * The default delimiter is the caret (^) symbol. This is derived from
 * taking an ib^gib address and turning it into an ibGib object (note
 * the capitalized "G").
 */
export const IBGIB_DELIMITER = '^';
/**
 * Gib is often just a single hash for a single ib^gib record.
 * But if the ibgib has a tjp, which implies a timeline ("stream"
 * in some senses), then we will include the tjp gib hash alongside the
 * individual punctilear ibgib frame.
 *
 * ATOW this has the default schema of
 *
 * @example "comment abc^TJPHASH123", "comment abc^TJPHASH123.THISRECORDHASH456"
 */
export const GIB_DELIMITER = '.';
/**
 * This is the address of the ROOT ibgib with the default delimiter (caret ^).
 */
export const ROOT_ADDR = 'ib^gib'; // `${IB}${IBGIB_DELIMITER}${GIB}`;
/**
 * Some rel8ns should not be able to be renamed or removed, as these have
 * "special" semantic meaning in the low-level graphing protocol.
 *
 * ## notes
 *
 * * Of course, this can be forged or tinkered with, and that ultimately is what
 *   consensus would be utilized for.
 * * protocols built on top of this may also have reserved rel8n/data key names
 */
export const FORBIDDEN_ADD_RENAME_REMOVE_REL8N_NAMES = ['past', 'ancestor', 'dna', 'tjp'];
