import { getIbGibAddr, } from '../../helper.mjs';
import { clone, getTimestamp, } from '@ibgib/helper-gib/dist/helpers/utils-helper.mjs';
import { IbGib_V1, IbGibData_V1, IbGibRel8ns_V1, Rel8n } from '../types.mjs';
import { TransformOpts_Rel8, TransformResult, IbGibAddr } from '../../types.mjs';
import { IBGIB_DELIMITER, GIB, FORBIDDEN_ADD_RENAME_REMOVE_REL8N_NAMES } from '../constants.mjs';
import { buildDna, getGib, isPrimitive } from './transform-helper.mjs';
/**
 * Original-ish V1 transform behavior.
 *
 * NOTE:
 *   This is NOT going to do the plan^gib stuff ATM.
 *   Also this does NOT add any identity information ATM.
 */
/**
 * Relate (and/or unrelate) other ibGib(s), thus mutating it **extrinsically**.
 */
export async function rel8(
    opts: TransformOpts_Rel8<IbGib_V1>
): Promise<TransformResult<IbGib_V1>> {
    const {
        noTimestamp, dna, linkedRel8ns,
        rel8nsToAddByAddr, rel8nsToRemoveByAddr,
        type = 'rel8'
    } = opts;
    let src = opts.src;
    const lc = '[rel8_v1]';
    if (type !== 'rel8') { throw new Error(`${lc} not a rel8 transform.`); }
    if (!opts.type) { opts.type = 'rel8' }

    // #region validation

    if (type !== 'rel8') { throw new Error(`${lc} not a rel8 transform.`); }
    if (!opts.type) { opts.type = 'rel8' }

    if (!src) { throw new Error(`${lc} src required.`); }
    if (!src!.ib) { throw new Error(`${lc} src.ib required.`); }
    if (src!.ib!.includes(IBGIB_DELIMITER)) {
        throw new Error(`${lc} ib can't contain hardcoded delimiter (${IBGIB_DELIMITER}) right now.`);
    }
    if (!src!.gib) { throw new Error(`${lc} src.gib required.`); }

    // if (!src.gib || src.gib === GIB) { throw new Error(`${lc} cannot relate to primitive ibGib.`); }
    if (isPrimitive({ ibGib: src })) { throw new Error(`${lc} cannot relate/unrelate primitive ibgib`); }

    // if neither add nor remove specified, what are we even doing?
    const isAdding = rel8nsToAddByAddr && Object.keys(rel8nsToAddByAddr!).length > 0;
    const isRemoving = rel8nsToRemoveByAddr && Object.keys(rel8nsToRemoveByAddr!).length > 0;
    if (!(isAdding || isRemoving)) {
        throw new Error(`${lc} gotta provide relations to either add or remove.`);
    }

    const srcAddr = getIbGibAddr({ ib: src.ib, gib: src.gib });
    if (opts.srcAddr && srcAddr !== opts.srcAddr) { throw new Error(`${lc} srcAddr from src does not equal opts.srcAddr`); }
    opts.srcAddr = srcAddr;

    // validate all ibgib addresses to add/remove
    const fnValidIbGibAddr = (s: string) => {
        // for now, only requiring a single character and trailing delim.
        // i.e. primitive with implied 'gib'
        return s && typeof (s) === 'string' && s.length >= 2 &&
            s.includes('^') && s.split('^')[0].length >= 1;
    };
    Object.keys(rel8nsToAddByAddr || {})
        .map(x => (rel8nsToAddByAddr || {})[x])
        .forEach(rel8ds => {
            if (!(rel8ds && rel8ds.every(rel8d => fnValidIbGibAddr(rel8d)))) {
                throw new Error(`${lc} Invalid rel8n attempt. Must be valid ibGibs. Did you include a delimiter (^)?`);
            }
        });
    Object.keys(rel8nsToRemoveByAddr || {})
        .map(x => (rel8nsToRemoveByAddr || {})[x])
        .forEach(rel8ds => {
            if (!(rel8ds && rel8ds.every(rel8d => fnValidIbGibAddr(rel8d)))) {
                throw new Error(`${lc} Invalid remove rel8n attempt. Must be valid ibGibs. Did you include a delimiter (^)?`);
            }
        });

    // #endregion validation

    // we want to forget `src` proper very quickly because it may have other
    // non-IbGib properties that are not relevant to our transform.
    let dto: IbGib_V1 = { ib: src.ib, gib: src.gib, };
    if (src.data && Object.keys(src.data).length > 0) { dto.data = src.data; }
    if (src.rel8ns && Object.keys(src.rel8ns).length > 0) { dto.rel8ns = src.rel8ns; }
    src = dto;

    const newIbGib = clone(src) as IbGib_V1<IbGibData_V1>;

    const data: any = clone(src.data || {});
    if (opts.nCounter || Object.keys(data).includes('n')) {
        if (Object.keys(data).includes('n')) {
            if (Number.isInteger(data.n)) {
                if (data.n >= 0) {
                    data.n = data.n + 1;
                } else {
                    console.warn(`${lc} data.n is less than 0, which is unexpected. Resetting data.n to 0.`);
                    data.n = 0;
                }
            } else {
                throw new Error('cannot increment nCounter because data.n is not a number.');
            }
        } else {
            data.n = 0;
        }
    }

    if (!noTimestamp) {
        const date = new Date();
        data.timestamp = getTimestamp(date);
        data.timestampMs = date.getMilliseconds();
    }

    const rel8ns: IbGibRel8ns_V1 = clone(src.rel8ns || {});
    Object.keys(rel8nsToAddByAddr || {}).forEach(rel8nName => {
        if (FORBIDDEN_ADD_RENAME_REMOVE_REL8N_NAMES.includes(rel8nName)) {
            throw new Error(`${lc} Cannot manually add relationship: ${rel8nName}.`);
        }
        const existingRel8d = rel8ns[rel8nName] || [];
        const toAddRel8d = rel8nsToAddByAddr![rel8nName];
        const newRel8d = toAddRel8d!.filter(x => !existingRel8d.includes(x));
        rel8ns[rel8nName] = existingRel8d.concat(newRel8d);
    });
    Object.keys(rel8nsToRemoveByAddr || {}).forEach(rel8nName => {
        if (FORBIDDEN_ADD_RENAME_REMOVE_REL8N_NAMES.includes(rel8nName)) {
            throw new Error(`${lc} Cannot manually remove relationship: ${rel8nName}.`);
        }
        const existingRel8d = rel8ns[rel8nName] || [];
        const toRemoveRel8d = rel8nsToRemoveByAddr![rel8nName] || [];
        const prunedRel8d = existingRel8d.filter((x: IbGibAddr) => !toRemoveRel8d!.includes(x));
        if (prunedRel8d.length > 0) {
            rel8ns[rel8nName] = prunedRel8d;
        } else {
            delete rel8ns[rel8nName];
        }
    });
    rel8ns.past = (rel8ns.past || []).concat([srcAddr]);
    (linkedRel8ns || [])
        .filter(linkedRel8nName => Object.keys(rel8ns).includes(linkedRel8nName))
        .filter(linkedRel8nName => (rel8ns[linkedRel8nName] || []).length > 1)
        .forEach(linkedRel8nName => {
            // take the last item only, and put it in an array
            let initialLength = rel8ns[linkedRel8nName]!.length;
            rel8ns[linkedRel8nName] = [rel8ns[linkedRel8nName]![initialLength - 1]];
        });

    // rel8ns.past = linkedRel8ns?.includes(Rel8n.past) ?
    //     [srcAddr] :
    //     (rel8ns.past || []).concat([srcAddr]);

    if (data.isTjp) {
        let tjpRel8n: IbGibAddr[] = rel8ns['tjp'] || [];
        tjpRel8n.push(srcAddr);
        rel8ns.tjp = tjpRel8n;
        delete data.isTjp;
    }

    newIbGib.data = data;
    newIbGib.rel8ns = rel8ns;
    // newIbGib.gib = await sha256v1(newIbGib, '');
    const hasTjp = (rel8ns.tjp?.length ?? 0) > 0;

    let transformDna: IbGib_V1 | null = null;
    if (dna) {
        transformDna = await buildDna(opts);
        const dnaAddr = getIbGibAddr({ ibGib: transformDna });
        rel8ns.dna = linkedRel8ns?.includes(Rel8n.dna) ?
            rel8ns.dna = [dnaAddr] :
            rel8ns.dna = (rel8ns.dna || []).concat(dnaAddr);
    }

    newIbGib.gib = await getGib({ ibGib: newIbGib, hasTjp });

    const result: TransformResult<IbGib_V1> = { newIbGib };
    if (transformDna) { result.dnas = [transformDna]; }
    return result;
}
