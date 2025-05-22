import { clone, } from '@ibgib/helper-gib/dist/helpers/utils-helper.mjs';

import { getIbGibAddr, } from '../helper.mjs';
import { getGibInfo } from './transforms/transform-helper.mjs';
import { IbGibRel8ns_V1, IbGib_V1 } from "./types.mjs";
import { GIB, GIB_DELIMITER } from './constants.mjs';

/**
 * Helper function that checks the given `ibGib` to see if it
 * either has a tjp or is a tjp itself.
 *
 * ## notes
 *
 * Only unique ibGibs are meant to have tjps, or rather, if an
 * ibGib timeline is expected to be unique over "time", then the
 * tjp is an extremely convenient mechanism that provides a
 * "name" for that timeline.
 *
 * Otherwise, if they are not unique, then successive "different"
 * timelines cannot be easily referenced by their first unique
 * frame in time, making it much harder to pub/sub updates among
 * other things. (If there are no unique frames, then they are
 * the same ibGib.)
 *
 * ## tjp = temporal junction point
 *
 * I've written elsewhere on this as well. Refer to B2tF2.
 *
 * @returns true if the ibGib has/is a tjp, else false
 */
export function hasTjp({ ibGib }: { ibGib: IbGib_V1 }): boolean {
    const lc = `[${hasTjp.name}]`;

    if (!ibGib) {
        console.warn(`${lc} ibGib falsy. (W: 884178562f5b4f15933ac4d98db74cc6)`);
        return false;
    }

    if (ibGib.data?.isTjp || ibGib.rel8ns?.tjp?.length! > 0) {
        return true;
    }

    // dna transforms do not have tjp
    const dnaPrimitives = ['fork^gib', 'mut8^gib', 'rel8^gib'];
    if ((ibGib.rel8ns?.ancestor ?? []).some(x => dnaPrimitives.includes(x))) {
        return false;
    }

    if (!ibGib.gib) {
        console.warn(`${lc} ibGib.gib falsy. (W: 6400d780822b44d992846f1196509be3)`);
        return false;
    }
    if (ibGib.gib.includes(GIB_DELIMITER)) {
        return true;
    }

    if (ibGib.gib === GIB) {
        // primitive
        return false;
    }

    // use more expensive getGibInfo call.
    // could possibly just return false at this point, but since gib info
    // would change if we change our standards for gib, this is nicer.
    const gibInfo = getGibInfo({ ibGibAddr: getIbGibAddr({ ibGib }) });
    return gibInfo.tjpGib ? true : false;
}

/**
 * If you have an ibgib object, it may also contain other properties/functions.
 *
 * This helper function takes the incoming object and returns a copy
 * @param param0
 * @returns
 */
export function toDto<TData, TRel8ns extends IbGibRel8ns_V1 = IbGibRel8ns_V1>({
    ibGib,
}: {
    ibGib: IbGib_V1,
}): IbGib_V1<TData, TRel8ns> {
    const lc = `[${toDto.name}]`;
    if (!ibGib.ib) { console.warn(`${lc} ibGib.ib is falsy. (W: e60e41c2a1fc48268379d88ce13cb77b)`); }
    if (!ibGib.gib) { console.warn(`${lc} ibGib.gib is falsy. (W: fb3889cbf0684ae4ac51e48f28570377)`); }

    let dtoIbGib: IbGib_V1<TData, TRel8ns> = { ib: (ibGib.ib || '').slice() };
    if (ibGib.gib) { dtoIbGib.gib = ibGib.gib.slice(); };
    if (ibGib.data) {
        // we do not clone binaries when creating the dto.
        dtoIbGib.data =
            ibGib.data instanceof Uint8Array ?
                ibGib.data :
                clone(ibGib.data);
    }
    if (ibGib.rel8ns) { dtoIbGib.rel8ns = clone(ibGib.rel8ns); }

    return dtoIbGib;
}
