import { fork } from './transforms/fork.mjs';
import { mut8 } from './transforms/mut8.mjs';
import { rel8 } from './transforms/rel8.mjs';
import { Ib, IbGib, IbGibRel8ns, TransformResult, TemporalJunctionPointOptions } from '../types.mjs';
import { IbGib_V1 } from './types.mjs';
import { IB, GIB, ROOT } from './constants.mjs';

export class Factory_V1 {
    static root() {
        return Factory_V1.primitive({ ib: IB });
    }

    /**
     * Returns an ibGib primitive with the given `ib`, e.g. "{ib: '7', gib: 'gib'}".
     *
     * @returns a single primitive ibGib
     */
    static primitive({
        ib
    }: {
        ib: Ib
    }): IbGib_V1 {
        return { ib, gib: GIB };
    }

    /**
     * generates multiple primitive ibgibs from the given `ibs` array.
     * @returns array of generated ibgibs.
     */
    static primitives({
        ibs
    }: {
        ibs: Ib[]
    }): IbGib_V1[] {
        return ibs.map(ib => Factory_V1.primitive({ ib }));
    }

    /**
     * Takes the incoming `parentIbGib` and forks it. Then applies the
     * `data` and/or `rel8ns` if any, depending on the other config params.
     *
     * @returns The entire transform result object that includes the newly produced ibGib as well as any derivative/intermediate ibgibs.
     */
    static async firstGen<TData = any>({
        ib = IB,
        parentIbGib = Factory_V1.root(),
        data,
        rel8ns,
        dna,
        tjp,
        linkedRel8ns,
        noTimestamp,
        nCounter,
    }: {
        ib: Ib,
        parentIbGib: IbGib,
        data?: TData,
        rel8ns?: IbGibRel8ns,
        dna?: boolean,
        tjp?: TemporalJunctionPointOptions;
        linkedRel8ns?: string[],
        noTimestamp?: boolean,
        nCounter?: boolean,
    }): Promise<TransformResult<IbGib_V1>> {
        const lc = `[firstGen]`;
        /** * Multiple transform steps will create multiple results. */
        const interimResults: TransformResult<IbGib_V1>[] = [];
        let src: IbGib_V1 = parentIbGib || ROOT;
        let resFork = await fork({
            src,
            destIb: ib,
            tjp,
            dna,
            linkedRel8ns,
            noTimestamp,
            nCounter,
        });
        interimResults.push(resFork);
        src = resFork.newIbGib;

        if (data) {
            let resMut8 = await mut8({
                src,
                dataToAddOrPatch: data,
                dna,
                linkedRel8ns,
                noTimestamp,
                nCounter,
            });
            interimResults.push(resMut8);
            src = resMut8.newIbGib;
        };

        if (rel8ns) {
            let resRel8 = await rel8({
                src,
                rel8nsToAddByAddr: rel8ns,
                dna,
                linkedRel8ns,
                noTimestamp,
                nCounter,
            });
            interimResults.push(resRel8);
            // src = resRel8.newIbGib; // not needed because not used (this is the last step)
        }

        if (interimResults.length > 1) {
            const newIbGib = interimResults.slice(interimResults.length - 1)[0].newIbGib;
            const result = {
                newIbGib,
                intermediateIbGibs: interimResults.slice(0, interimResults.length - 1).map(x => x.newIbGib),
            } as TransformResult<IbGib_V1>;
            if (dna) {
                let dnas: IbGib_V1[] = [];
                interimResults.forEach(res => { dnas = dnas.concat(res.dnas!); });
                result.dnas = dnas;
            }
            return result;
        } else if (interimResults.length === 1) {
            // for some reason the caller just used this as a fork.
            return interimResults[0];
        } else {
            throw new Error(`${lc} hmm, I'm not sure...`);
        }
    }
}
