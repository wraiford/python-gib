/**
 * Test basic mut8 transforms.
 *
 * NOTE:
 *   This only tests the node implementation, and manual testing
 *   is required for browser until I get some kind of browser testing
 *   going.
 */
import { clone, } from '@ibgib/helper-gib/dist/helpers/utils-helper.mjs';
import {
    firstOfAll, ifWe, ifWeMight, iReckon, respecfully
} from '@ibgib/helper-gib/dist/respec-gib/respec-gib.mjs';
const maam = `[${import.meta.url}]`, sir = maam;

import { IbGib_V1, IbGibRel8ns_V1, Rel8n } from '../types.mjs';
import { TransformOpts_Rel8, IbGibAddr, IbGibRel8ns } from '../../types.mjs';
import { getIbGibAddr, getIbAndGib } from '../../helper.mjs';
import { ROOT_ADDR } from '../constants.mjs';
import { fork } from './fork.mjs';
// import { mut8 } from './mut8.mjs';
import { rel8 } from './rel8.mjs';
import { Factory_V1 as factory } from '../factory.mjs';
import { getGib, getGibInfo } from './transform-helper.mjs';
import { sha256v1 } from '../sha256v1.mjs';

const PRIMITIVE_IBGIBS = [
    factory.root(),
    ...factory.primitives({
        ibs: [
            'a', '7', 'tag',
            'any string/value that isnt hashed with a gib is a primitive',
            // e.g. 6 -> 6^ -> 6^gib are all equivalent ib^gib addresses,
        ]
    }),
];

const STR = 'string here';
const RENAME_ME_KEY = 'rename me please';
const RENAMED_KEY = 'renamed successfully';
const RENAME_VALUE = 'hey heres a value';
const DATA_SIMPLE_XY = { x: 1, y: 2 };
const DATA_SIMPLE_XY_STR = { x: 1, y: 2, str: STR };
const DATA_COMPLEX_XY_NESTED = {
    xyObj: DATA_SIMPLE_XY,
    nested1: { [RENAME_ME_KEY]: RENAME_VALUE },
};
const NEW_IB = 'new ib here yo';

const DATAS_SIMPLE = [
    DATA_SIMPLE_XY,
    DATA_SIMPLE_XY_STR,
];

const SIMPLE_REL8N_NAMES: string[] = [
    // just some possible example rel8n names
    'child', 'container', 'folder', 'identity', 'tag', 'liked'
];

/**
 * Generates a simple rel8ns to Add/Remove mapping from the given rel8nNames.
 *
 * @param rel8nNames list of rel8nnames that will be mapped to all of the sample test primitives
 *
 * @example
 * For example, if you pass in ['child', 'tag'], then this will build an object
 * from PRIMITIVE_IBGIBS.
 * {
 *   child: ['ib^gib', 'a^gib', '7^gib', 'tag^gib'...],
 *   tag: ['ib^gib', 'a^gib', '7^gib', 'tag^gib'...],
 * }
 */
function buildRel8nsToAddOrRemoveFromPrimitives(rel8nNames: string[]): IbGibRel8ns {
    const result: IbGibRel8ns = {};
    rel8nNames.forEach(rel8nName => {
        result[rel8nName] = PRIMITIVE_IBGIBS.map(x => getIbGibAddr({ ibGib: x }));
    });
    return result;
}

await respecfully(sir, `can't rel8 primitives to others`, async () => {
    for (const src of PRIMITIVE_IBGIBS) {

        await ifWe(sir, `should fail to add rel8ns`, async () => {
            let errored = false;
            try {
                const rel8nsToAddByAddr = buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);
                const _ignored = await rel8({ src, rel8nsToAddByAddr });
            } catch (error) {
                errored = true;
            }
            iReckon(sir, errored).isGonnaBeTrue()
        });

        await ifWe(sir, `should fail to remove rel8ns`, async () => {
            let errored = false;
            try {
                const rel8nsToRemoveByAddr = buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);
                const _ignored = await rel8({ src, rel8nsToRemoveByAddr });
            } catch (error) {
                errored = true;
            }
            iReckon(sir, errored).isGonnaBeTrue()
        });

        await ifWe(sir, `should fail to add and remove rel8ns`, async () => {
            let errored = false;
            try {
                const rel8nsToAddByAddr =
                    buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);
                const rel8nsToRemoveByAddr =
                    buildRel8nsToAddOrRemoveFromPrimitives([SIMPLE_REL8N_NAMES[0]]); // just the first, no real reason
                const _ignored = await rel8({ src, rel8nsToAddByAddr, rel8nsToRemoveByAddr });
            } catch (error) {
                errored = true;
            }
            iReckon(sir, errored).isGonnaBeTrue()
        });

    }
});

await respecfully(sir, `when rel8ing a regular ibgib`, async () => {

    await respecfully(sir, `simple rel8ns to 1st gens (from primitives)`, async () => {
        for (const primitive of PRIMITIVE_IBGIBS) {

            await ifWe(sir, `should add/remove simple rel8ns`, async () => {

                let { newIbGib: src } = await fork({ src: primitive, noTimestamp: true });

                // #region add rel8ns

                const rel8nsToAddByAddr = buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);

                // we now have a non-primitive 1st gen source and wish to
                // add rel8ns in it pointing to other ibGibs.

                const { newIbGib: rel8nsAddedIbGib } =
                    await rel8({ src, rel8nsToAddByAddr, noTimestamp: true });
                iReckon(sir, rel8nsAddedIbGib).isGonnaBeTruthy();
                iReckon(sir, rel8nsAddedIbGib.rel8ns).isGonnaBeTruthy();
                iReckon(sir, rel8nsAddedIbGib.rel8ns).isGonnaBeTruthy();
                const rel8nNames_AddedIbGib = Object.keys(rel8nsAddedIbGib.rel8ns!);
                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    iReckon(sir, rel8nNames_AddedIbGib).includes(simpleRel8nName);
                    const simpleRel8nAddrs = rel8nsAddedIbGib.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, simpleRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, simpleRel8nAddrs.length === 0).isGonnaBeFalse();
                    const expectedRel8nAddrs = rel8nsToAddByAddr[simpleRel8nName] ?? [];
                    // iReckon(sir, expectedRel8nAddrs.length === 0).not.toHaveSize(0);
                    iReckon(sir, expectedRel8nAddrs.length === 0).isGonnaBeFalse();
                    iReckon(sir, simpleRel8nAddrs).isGonnaBe(expectedRel8nAddrs!);
                });

                // #endregion

                // #region Remove rel8ns

                const rel8nsToRemoveByAddr: IbGibRel8ns = {};
                SIMPLE_REL8N_NAMES.forEach(x => rel8nsToRemoveByAddr[x] = [
                    ROOT_ADDR, 'tag^gib'
                ]);

                const { newIbGib: rel8nsRemovedIbGib } =
                    await rel8({ src: rel8nsAddedIbGib, rel8nsToRemoveByAddr, noTimestamp: true });
                iReckon(sir, rel8nsRemovedIbGib).isGonnaBeTruthy();
                iReckon(sir, rel8nsRemovedIbGib.rel8ns).isGonnaBeTruthy();
                iReckon(sir, rel8nsRemovedIbGib.rel8ns).isGonnaBeTruthy();

                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    const rel8dAddrs = rel8nsRemovedIbGib.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, rel8dAddrs).not.includes(to.not.include.any.members([ROOT_ADDR, 'tag^gib']);
                    [ROOT_ADDR, 'tag^gib'].forEach(x => { iReckon(sir, rel8dAddrs).not.includes(x); })

                    // iReckon(sir, rel8dAddrs).to.include.all.members(
                    //     PRIMITIVE_IBGIBS
                    //         .map(x => getIbGibAddr({ ibGib: x }))
                    //         .filter(addr => addr !== ROOT_ADDR && addr !== 'tag^gib')
                    // );
                    PRIMITIVE_IBGIBS
                        .map(x => getIbGibAddr({ ibGib: x }))
                        .filter(addr => addr !== ROOT_ADDR && addr !== 'tag^gib')
                        .forEach(x => iReckon(sir, rel8dAddrs).includes(x));
                });

                //#endregion

            });

            /**
              * we're going to perform the same transforms to two different, unique sources.
              * (in this case, differentiated by the ib).
              * for the src1, we're going to execute transforms via the normal calls.
              * then for src2, we'll make the call from the dna generated from the src1 transforms.
              * both should make the same transformations with regards to the rel8ns added/removed.
             */
            await ifWe(sir, `should create pure, reproducible dna`, async () => {

                const ib1 = 'ib 1 yo';
                let { newIbGib: src1 } = await fork({ src: primitive, noTimestamp: true, destIb: ib1 });
                const ib2 = 'ib 2 here';
                let { newIbGib: src2 } = await fork({ src: primitive, noTimestamp: true, destIb: ib2 });
                const src2Addr = getIbGibAddr({ ibGib: src2 });

                // #region add rel8ns

                const rel8nsToAddByAddr = buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);

                // we now have a non-primitive 1st gen source and wish to
                // add rel8ns in it pointing to other ibGibs.

                const { newIbGib: rel8nsAddedIbGib, intermediateIbGibs, dnas: dnasRel8Add } =
                    await rel8({ src: src1, rel8nsToAddByAddr, noTimestamp: true, dna: true });
                iReckon(sir, dnasRel8Add).isGonnaBeTruthy();
                iReckon(sir, dnasRel8Add).isGonnaBeTruthy();
                // ATOW dna only produces 1
                const rel8DnaAdd = dnasRel8Add![0];
                const rel8DnaDataAdd: TransformOpts_Rel8<IbGib_V1> = clone(rel8DnaAdd.data!);
                const rel8nNames_AddedIbGib = Object.keys(rel8nsAddedIbGib.rel8ns!);
                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    iReckon(sir, rel8nNames_AddedIbGib).includes(simpleRel8nName);
                    const simpleRel8nAddrs = rel8nsAddedIbGib.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, simpleRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, simpleRel8nAddrs.length === 0).isGonnaBeFalse();
                    const expectedRel8nAddrs = rel8nsToAddByAddr[simpleRel8nName] ?? [];
                    // iReckon(sir, expectedRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, expectedRel8nAddrs.length === 0).isGonnaBeFalse();
                    iReckon(sir, simpleRel8nAddrs).isGonnaBe(expectedRel8nAddrs!);
                });

                // rerun the same rel8 call, but get the args from the dna of the
                // previous call. Then check to ensure the same rel8ns were added.

                rel8DnaDataAdd.src = src2;
                rel8DnaDataAdd.srcAddr = src2Addr;
                const { newIbGib: rel8nsAddedIbGib2, dnas: _dnasRel8Add2 } =
                    await rel8(rel8DnaDataAdd);
                const rel8nNames_AddedIbGib2 = Object.keys(rel8nsAddedIbGib2.rel8ns!);
                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    iReckon(sir, rel8nNames_AddedIbGib2).includes(simpleRel8nName);
                    const simpleRel8nAddrs = rel8nsAddedIbGib2.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, simpleRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, simpleRel8nAddrs.length === 0).isGonnaBeFalse();
                    const expectedRel8nAddrs = rel8nsToAddByAddr[simpleRel8nName] ?? [];
                    // iReckon(sir, expectedRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, expectedRel8nAddrs.length === 0).isGonnaBeFalse();
                    iReckon(sir, simpleRel8nAddrs).isGonnaBe(expectedRel8nAddrs!);
                });

                // #endregion

                // #region Remove rel8ns

                const rel8nsToRemoveByAddr: IbGibRel8ns = {};
                SIMPLE_REL8N_NAMES.forEach(x => rel8nsToRemoveByAddr[x] = [
                    ROOT_ADDR, 'tag^gib'
                ]);

                const { newIbGib: rel8nsRemovedIbGib, dnas: dnasRel8Remove } =
                    await rel8({ src: rel8nsAddedIbGib, rel8nsToRemoveByAddr, noTimestamp: true, dna: true });
                // ATOW dna only produces 1
                const rel8DnaRemove = dnasRel8Remove![0];
                const rel8DnaDataRemove: TransformOpts_Rel8<IbGib_V1> = clone(rel8DnaRemove.data!);
                const rel8nNames_RemoveIbGib = Object.keys(rel8nsRemovedIbGib.rel8ns!);

                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    const rel8dAddrs = rel8nsRemovedIbGib.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, rel8dAddrs).to.not.include.any.members([ROOT_ADDR, 'tag^gib']);
                    [ROOT_ADDR, 'tag^gib'].every(x => { iReckon(sir, rel8dAddrs).not.includes(x); });

                    // iReckon(sir, rel8dAddrs).to.include.all.members(
                    //     PRIMITIVE_IBGIBS
                    //         .map(x => getIbGibAddr({ ibGib: x }))
                    //         .filter(addr => addr !== ROOT_ADDR && addr !== 'tag^gib')
                    // );
                    PRIMITIVE_IBGIBS
                        .map(x => getIbGibAddr({ ibGib: x }))
                        .filter(addr => addr !== ROOT_ADDR && addr !== 'tag^gib')
                        .forEach(x => iReckon(sir, rel8dAddrs).includes(x));
                });

                // rerun the same (un)rel8 call, but get the args from the dna of the
                // previous call. Then check to see if the same rel8ns were removed.
                // it should remove the same rel8ns.

                rel8DnaDataRemove.src = rel8nsAddedIbGib2;
                rel8DnaDataRemove.srcAddr = undefined;
                const { newIbGib: rel8nsRemovedIbGib2, dnas: _dnasRel8Remove } =
                    await rel8(rel8DnaDataRemove);

                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    const rel8dAddrs = rel8nsRemovedIbGib2.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, rel8dAddrs).to.not.include.any.members([ROOT_ADDR, 'tag^gib']);
                    [ROOT_ADDR, 'tag^gib'].forEach(x => iReckon(sir, rel8dAddrs).not.includes(x))

                    // iReckon(sir, rel8dAddrs).to.include.all.members(
                    //     PRIMITIVE_IBGIBS
                    //         .map(x => getIbGibAddr({ ibGib: x }))
                    //         .filter(addr => addr !== ROOT_ADDR && addr !== 'tag^gib')
                    // );
                    PRIMITIVE_IBGIBS
                        .map(x => getIbGibAddr({ ibGib: x }))
                        .filter(addr => addr !== ROOT_ADDR && addr !== 'tag^gib')
                        .forEach(x => iReckon(sir, rel8dAddrs).includes(x));
                });

                //#endregion
            });

            await ifWe(sir, `should rel8 linked rel8ns to make only one rel8n`, async () => {
                // linkedRel8ns should produce a rel8n that only has one target
                let testRel8nName = 'test';
                let { newIbGib: src1 } =
                    await fork({ src: primitive, linkedRel8ns: ['past', 'ancestor'] });
                let src1Addr = getIbGibAddr({ ibGib: src1 });
                iReckon(sir, (src1?.rel8ns?.past || []).length).asTo('src1.rel8ns.past.length').isGonnaBe(0);
                if (primitive.ib !== 'ib') {
                    iReckon(sir, (src1?.rel8ns?.ancestor || []).length).asTo('src1.rel8ns.ancestor.length').isGonnaBe(1);
                }

                let { newIbGib: src2 } =
                    await rel8({
                        src: src1,
                        rel8nsToAddByAddr: { [testRel8nName]: ['a^gib'] },
                        linkedRel8ns: ['past', 'ancestor', testRel8nName],
                    });
                iReckon(sir, (src2?.rel8ns?.past || []).length).asTo('src2.rel8ns.past.length').isGonnaBe(1);
                if (primitive.ib !== 'ib') {
                    iReckon(sir, (src2?.rel8ns?.ancestor || []).length).asTo('src2.rel8ns.ancestor.length').isGonnaBe(1);
                }
                iReckon(sir, (src2?.rel8ns![testRel8nName] || []).length).asTo(`src2.rel8ns.${testRel8nName}.length`).isGonnaBe(1);
                iReckon(sir, src2?.rel8ns![testRel8nName]![0]).asTo(`src2.rel8ns.${testRel8nName}[0]`).isGonnaBe('a^gib');

                let { newIbGib: src3 } =
                    await rel8({
                        src: src2,
                        rel8nsToAddByAddr: { [testRel8nName]: ['b^gib'] },
                        linkedRel8ns: ['past', 'ancestor', testRel8nName],
                    });
                iReckon(sir, (src3?.rel8ns?.past || []).length).asTo('src3.rel8ns.past.length').isGonnaBe(1);
                if (primitive.ib !== 'ib') {
                    iReckon(sir, (src3?.rel8ns?.ancestor || []).length).asTo('src3.rel8ns.ancestor.length').isGonnaBe(1);
                }
                iReckon(sir, (src3?.rel8ns![testRel8nName] || []).length).asTo(`src3.rel8ns.${testRel8nName}.length`).isGonnaBe(1);
                iReckon(sir, src3?.rel8ns![testRel8nName]![0]).asTo(`src3.rel8ns.${testRel8nName}[0]`).isGonnaBe('b^gib');

            });

            await ifWe(sir, `should rel8 tjp ASAP, i.e. first rel8 after fork, also shoehorned tjpGib testing`, async () => {
                // the tjp rel8n should be set ASAP because it's very important.
                // so if the first transform after fork is a rel8, then do it there.
                const testRel8ns = { irrelevant: ['ib^gib'] };
                const { newIbGib: tjpIbGib } =
                    await fork({ src: primitive, tjp: { uuid: true, timestamp: true } });
                const tjpAddr = getIbGibAddr({ ibGib: tjpIbGib });
                const tjpAddrGib = getIbAndGib({ ibGibAddr: tjpAddr }).gib;
                iReckon(sir, tjpIbGib?.data?.isTjp).asTo('src1.data.isTjp').isGonnaBeTruthy();
                iReckon(sir, tjpIbGib?.rel8ns?.tjp).asTo('src1.rel8ns.tjp').isGonnaBeUndefined();
                const { newIbGib: hasRel8dTjp } =
                    await rel8({ src: tjpIbGib, rel8nsToAddByAddr: testRel8ns });
                const hasRel8dTjpAddr = getIbGibAddr({ ibGib: hasRel8dTjp });
                const hasRel8dTjpAddrGib = getIbAndGib({ ibGibAddr: hasRel8dTjpAddr }).gib;
                iReckon(sir, hasRel8dTjp?.data?.isTjp).asTo('src2.data.isTjp').isGonnaBeUndefined();
                iReckon(sir, hasRel8dTjp?.rel8ns?.tjp).asTo('src2.rel8ns.tjp').isGonnaBeTruthy();
                iReckon(sir, hasRel8dTjp!.rel8ns!.tjp!.length).asTo('src2.rel8ns.tjp.length').isGonnaBe(1);
                iReckon(sir, hasRel8dTjp!.rel8ns!.tjp!).includes(tjpAddr);

                // the gib should not just be the hash, since it has a tjp timeline
                iReckon(sir, hasRel8dTjpAddrGib).includes(tjpAddrGib);

                // shoe-horning in here some getGibInfo testing...eesh
                const hasRel8dTjpGibInfo = getGibInfo({ ibGibAddr: hasRel8dTjpAddr }); // via addr
                iReckon(sir, hasRel8dTjpGibInfo.isPrimitive).isGonnaBeUndefined();
                iReckon(sir, hasRel8dTjpGibInfo.piecesCount).asTo('pieces count').isGonnaBe(2);
                const hasRel8dTjpHash = await sha256v1(hasRel8dTjp, '');
                iReckon(sir, hasRel8dTjpGibInfo.punctiliarHash).asTo('punctiliarHash').isGonnaBe(hasRel8dTjpHash);
                iReckon(sir, hasRel8dTjpGibInfo.tjpGib).isGonnaBe(tjpAddrGib);
                // the info should be the same if we get it straight from the gib
                const hasRel8dTjpGibInfo_viaGib = getGibInfo({ gib: hasRel8dTjpAddrGib }); // via gib
                iReckon(sir, hasRel8dTjpGibInfo_viaGib).asTo('infos via addr and gib should be equal').isGonnaBe(hasRel8dTjpGibInfo);

                // ok, yes my testing is out of control, but I'm going to shoehorn in here
                // another rel8 and make sure that the punctiliar hash is correct and the gib only has two pieces.
                const testRel8ns2 = { more_irrelevant: ['ib^gib'] };
                const { newIbGib: thirdGenIbGib } =
                    await rel8({ src: hasRel8dTjp, rel8nsToAddByAddr: testRel8ns });
                const thirdGenAddr = getIbGibAddr({ ibGib: thirdGenIbGib });
                const thirdGenGibInfo = getGibInfo({ ibGibAddr: thirdGenAddr });
                const thirdGenHash = await sha256v1(thirdGenIbGib, '');
                iReckon(sir, thirdGenGibInfo.punctiliarHash).isGonnaBe(thirdGenHash);
                iReckon(sir, thirdGenGibInfo.tjpGib).asTo('third gen match tjpAddrGib').isGonnaBe(tjpAddrGib);
                iReckon(sir, thirdGenGibInfo.piecesCount).asTo('third gen pieces').isGonnaBe(2);
            });
        }
    });

    await respecfully(sir, `nCounter`, async () => {
        await ifWe(sir, `should increment existing n counter`, async () => {
            for (const primitive of PRIMITIVE_IBGIBS) {
                let { newIbGib: src_0 } =
                    await fork({ src: primitive, nCounter: true });

                iReckon(sir, src_0.data).isGonnaBeTruthy();
                iReckon(sir, src_0.data!.n).isGonnaBe(0);
                iReckon(sir, src_0!.data?.isTjp).asTo("isTjp").isGonnaBeUndefined();

                const rel8nsToAddByAddr = buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);

                // we now have a non-primitive 1st gen source and wish to
                // add rel8ns in it pointing to other ibGibs.

                const { newIbGib: src_1 } =
                    await rel8({
                        src: src_0,
                        rel8nsToAddByAddr,
                        noTimestamp: true,
                        nCounter: true
                    });
                iReckon(sir, src_1).isGonnaBeTruthy();
                iReckon(sir, src_1.rel8ns).isGonnaBeTruthy();
                iReckon(sir, src_1.rel8ns).isGonnaBeTruthy();
                const rel8nNames_AddedIbGib = Object.keys(src_1.rel8ns!);
                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    iReckon(sir, rel8nNames_AddedIbGib).includes(simpleRel8nName);
                    const simpleRel8nAddrs = src_1.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, simpleRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, simpleRel8nAddrs.length === 0).isGonnaBeFalse();
                    const expectedRel8nAddrs = rel8nsToAddByAddr[simpleRel8nName] ?? [];
                    // iReckon(sir, expectedRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, expectedRel8nAddrs.length === 0).isGonnaBeFalse();
                    iReckon(sir, simpleRel8nAddrs).isGonnaBe(expectedRel8nAddrs!);
                });

                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBe(1);
                iReckon(sir, src_1!.data?.isTjp).asTo("isTjp").isGonnaBeUndefined();
            }
        });
        await ifWe(sir, `should start new n counter, implicit nCounter falsy`, async () => {
            for (const primitive of PRIMITIVE_IBGIBS) {
                let { newIbGib: src_0 } =
                    await fork({ src: primitive });

                iReckon(sir, src_0.data).isGonnaBeTruthy();
                iReckon(sir, src_0.data).isGonnaBeTruthy();
                iReckon(sir, src_0.data!.n).isGonnaBeUndefined();

                const rel8nsToAddByAddr = buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);

                // we now have a non-primitive 1st gen source and wish to
                // add rel8ns in it pointing to other ibGibs.

                const { newIbGib: src_1 } =
                    await rel8({
                        src: src_0,
                        rel8nsToAddByAddr,
                        noTimestamp: true,
                        nCounter: true
                    });
                iReckon(sir, src_1).isGonnaBeTruthy();
                iReckon(sir, src_1.rel8ns).isGonnaBeTruthy();
                iReckon(sir, src_1.rel8ns).isGonnaBeTruthy();
                const rel8nNames_AddedIbGib = Object.keys(src_1.rel8ns!);
                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    iReckon(sir, rel8nNames_AddedIbGib).includes(simpleRel8nName);
                    const simpleRel8nAddrs = src_1.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, simpleRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, simpleRel8nAddrs.length === 0).isGonnaBeFalse();
                    const expectedRel8nAddrs = rel8nsToAddByAddr[simpleRel8nName] ?? [];
                    // iReckon(sir, expectedRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, expectedRel8nAddrs.length === 0).isGonnaBeFalse();
                    iReckon(sir, simpleRel8nAddrs).isGonnaBe(expectedRel8nAddrs!);
                });

                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBe(0);
            }
        });
        await ifWe(sir, `should start new n counter, explicit nCounter falsy`, async () => {
            for (const primitive of PRIMITIVE_IBGIBS) {
                let { newIbGib: src_0 } =
                    await fork({ src: primitive, nCounter: false });

                iReckon(sir, src_0.data).isGonnaBeTruthy();
                iReckon(sir, src_0.data).isGonnaBeTruthy();
                iReckon(sir, src_0.data!.n).isGonnaBeUndefined();
                iReckon(sir, src_0!.data!.isTjp).asTo("isTjp").isGonnaBeUndefined();

                const rel8nsToAddByAddr = buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);

                // we now have a non-primitive 1st gen source and wish to
                // add rel8ns in it pointing to other ibGibs.

                const { newIbGib: src_1 } =
                    await rel8({
                        src: src_0,
                        rel8nsToAddByAddr,
                        noTimestamp: true,
                        nCounter: true
                    });
                iReckon(sir, src_1).isGonnaBeTruthy();
                iReckon(sir, src_1.rel8ns).isGonnaBeTruthy();
                iReckon(sir, src_1.rel8ns).isGonnaBeTruthy();
                const rel8nNames_AddedIbGib = Object.keys(src_1.rel8ns!);
                SIMPLE_REL8N_NAMES.forEach(simpleRel8nName => {
                    iReckon(sir, rel8nNames_AddedIbGib).includes(simpleRel8nName);
                    const simpleRel8nAddrs = src_1.rel8ns![simpleRel8nName]!;
                    // iReckon(sir, simpleRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, simpleRel8nAddrs.length === 0).isGonnaBeFalse();
                    const expectedRel8nAddrs = rel8nsToAddByAddr[simpleRel8nName] ?? [];
                    // iReckon(sir, expectedRel8nAddrs).not.toHaveSize(0);
                    iReckon(sir, expectedRel8nAddrs.length === 0).isGonnaBeFalse();
                    iReckon(sir, simpleRel8nAddrs).isGonnaBe(expectedRel8nAddrs!);
                });

                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBe(0);
                iReckon(sir, src_1!.data!.isTjp).asTo("isTjp").isGonnaBeUndefined();
            }
        });
        //     for (const primitive of PRIMITIVE_IBGIBS) {
        //         let { newIbGib: src_0 } =
        //             await fork({src: primitive, noTimestamp: true, nCounter: false});

        //         iReckon(sir, src_0.data).isGonnaBeUndefined();

        //         let { newIbGib: src_1 } =
        //             await mut8({
        //                 src: src_0,
        //                 dataToAddOrPatch: DATA_SIMPLE_XY,
        //                 nCounter: true
        //             });
        //         iReckon(sir, src_1.data).isGonnaBeTruthy();
        //         iReckon(sir, src_1.data!.n).isGonnaBe(0);
        //     }
        // });

    });

    await respecfully(sir, `when rel8 with dna`, async () => {
        await ifWe(sir, `should have gibs that is corroborated with getGib`, async () => {
            for (const primitive of PRIMITIVE_IBGIBS) {
                let { newIbGib: src_0 } =
                    await fork({ src: primitive, nCounter: false, dna: true });

                const rel8nsToAddByAddr = buildRel8nsToAddOrRemoveFromPrimitives(SIMPLE_REL8N_NAMES);

                // we now have a non-primitive 1st gen source and wish to
                // add rel8ns in it pointing to other ibGibs.

                const { newIbGib, intermediateIbGibs, dnas } =
                    await rel8({
                        src: src_0,
                        rel8nsToAddByAddr,
                        noTimestamp: true,
                        nCounter: true,
                        dna: true,
                    });

                const ibGibs = [newIbGib, ...(intermediateIbGibs ?? []), ...(dnas ?? [])];
                for (let i = 0; i < ibGibs.length; i++) {
                    const ibGib = ibGibs[i];
                    const gottenGib = await getGib({ ibGib });
                    iReckon(sir, ibGib.gib).isGonnaBe(gottenGib);
                }
            }
        });
    });
});
