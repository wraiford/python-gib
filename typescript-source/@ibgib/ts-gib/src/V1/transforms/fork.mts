import { getIbGibAddr } from '../../helper.mjs';
import { clone, getUUID, getTimestamp, } from '@ibgib/helper-gib/dist/helpers/utils-helper.mjs';
import { sha256v1 } from '../sha256v1.mjs';
import { IbGib_V1, IbGibData_V1, IbGibRel8ns_V1, Rel8n } from '../types.mjs';
import { TransformOpts_Fork, TransformResult } from '../../types.mjs';
import { IBGIB_DELIMITER, ROOT_ADDR } from '../constants.mjs';
import { buildDna } from './transform-helper.mjs';

/**
 * Original-ish V1 transform behavior.
 * Going to create an ibGib containing the fork data.
 * Apply that fork and create a resulting ibGib.
 *
 * Takes the src ibGib, clears its past and adds a link to
 * the src via the 'ancestor' rel8n.
 *
 * NOTE:
 *   This is NOT going to do the plan^gib stuff ATM.
 *   Also this does NOT add any identity information ATM.
 */
export async function fork(opts: TransformOpts_Fork<IbGib_V1>): Promise<TransformResult<IbGib_V1>> {
    const {
        noTimestamp, dna,
        linkedRel8ns,
        destIb, uuid, tjp,
        cloneRel8ns, cloneData,
        type = 'fork',
    } = opts;
    let src = opts.src;

    const lc = '[fork_v1]';
    // #region validation
    if (type !== 'fork') { throw new Error(`${lc} not a fork transform.`); }
    if (!opts.type) { opts.type = 'fork' }

    if (!src) { throw new Error(`${lc} src required to fork.`); }
    if (!src!.ib) { throw new Error(`${lc} src.ib required.`); }
    // destIb is not required, as it just reuses src.ib
    if (destIb && destIb.includes(IBGIB_DELIMITER)) {
        throw new Error(`${lc} destIb can't contain (hardcoded) delimiter right now.`);
    }
    if (!src!.gib) { throw new Error(`${lc} src.gib required.`); }

    // #endregion

    // we want to forget `src` proper very quickly because it may have other
    // non-IbGib properties that are not relevant to our transform.
    let dto: IbGib_V1 = { ib: src.ib, gib: src.gib, };
    if (src.data && Object.keys(src.data).length > 0) { dto.data = src.data; }
    if (src.rel8ns && Object.keys(src.rel8ns).length > 0) { dto.rel8ns = src.rel8ns; }
    src = dto;

    const srcAddr = getIbGibAddr({ ib: src!.ib, gib: src.gib });
    opts.srcAddr = srcAddr;

    const rel8ns: IbGibRel8ns_V1 =
        cloneRel8ns && src.rel8ns && Object.keys(src.rel8ns).length > 0 ?
            clone(src.rel8ns) :
            {};
    const data: any = cloneData && src?.data ? clone(src!.data) : {};
    if (opts.nCounter) { data.n = 0; }
    const ancestor = linkedRel8ns?.includes(Rel8n.ancestor) ?
        [srcAddr] :
        (rel8ns.ancestor || []).concat([srcAddr]);
    rel8ns.ancestor = ancestor;

    // remove tjp if exists in rel8ns
    if (rel8ns.tjp) { delete rel8ns.tjp; }

    const newIbGib = clone(src) as IbGib_V1<IbGibData_V1>;
    if (noTimestamp && tjp?.timestamp) {
        throw new Error(`${lc} both noTimestamp and tjp.timestamp selected.`);
    }
    if (!noTimestamp || tjp?.timestamp) {
        const date = new Date();
        data.timestamp = getTimestamp(date);
        data.timestampMs = date.getMilliseconds();
    }
    if (tjp?.uuid || uuid) { data.uuid = await getUUID(); }
    if (tjp?.uuid || tjp?.timestamp) {
        data.isTjp = true;
    } else {
        if (data.isTjp) { delete data.isTjp; }
    }

    newIbGib.ib = destIb || 'ib';
    // rel8ns ignored if forking from the root ib^gib
    if (srcAddr !== ROOT_ADDR) { newIbGib.rel8ns = rel8ns; }
    if (Object.keys(data).length > 0) { newIbGib.data = data; }

    let transformDna: IbGib_V1 | null = null;
    if (dna) {
        transformDna = await buildDna(opts);
        const dnaAddr = getIbGibAddr({ ibGib: transformDna });
        rel8ns.dna = linkedRel8ns?.includes(Rel8n.dna) ?
            rel8ns.dna = [dnaAddr] :
            rel8ns.dna = (rel8ns.dna || []).concat(dnaAddr);
    }

    newIbGib.gib = await sha256v1(newIbGib, '');

    const result: TransformResult<IbGib_V1> = { newIbGib };
    if (transformDna) { result.dnas = [transformDna!] }
    return result;
}
