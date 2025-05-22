/**
 * Test basic mut8 transforms.
 *
 * NOTE:
 *   This only tests the node implementation, and manual testing
 *   is required for browser until I get some kind of browser testing
 *   going.
 */

import { clone, delay, } from '@ibgib/helper-gib/dist/helpers/utils-helper.mjs';
import {
    firstOfEach, firstOfAll, ifWe,
    lastOfEach, lastOfAll,
    ifWeMight, iReckon, respecfully
} from '@ibgib/helper-gib/dist/respec-gib/respec-gib.mjs';
const maam = `[${import.meta.url}]`, sir = maam;

import { IbGib_V1, IbGibRel8ns_V1 } from '../types.mjs';
import { TransformOpts_Mut8, IbGibAddr } from '../../types.mjs';
import { getIbGibAddr, getIbAndGib, } from '../../helper.mjs';
import { sha256v1, } from '../sha256v1.mjs';
import { ROOT } from '../constants.mjs';
import { fork } from './fork.mjs';
import { mut8 } from './mut8.mjs';
import { Factory_V1 as factory } from '../factory.mjs';
import { getGib, getGibInfo } from './transform-helper.mjs';

const PRIMITIVE_IBGIBS = [factory.root()].concat(factory.primitives({
    ibs: [
        'a', '7', 'tag',
        'any string/value that isnt hashed with a gib is a primitive',
        // e.g. 6 -> 6^ -> 6^gib are all equivalent ib^gib addresses,
    ]
}));

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

await respecfully(sir, `can't mut8 primitives (including the root)`, async () => {
    for (const src of PRIMITIVE_IBGIBS) {

        await ifWe(sir, `should fail to mut8 ib (ib: ${src.ib})`, async () => {
            let errored = false;
            try {
                const _ignored = await mut8({ src, mut8Ib: 'changed ' + src.ib });
            } catch (error) {
                errored = true;
            }
            iReckon(sir, errored).isGonnaBeTrue()
        });

        await ifWe(sir, `should fail to mut8 add or patch data (ib: ${src.ib})`, async () => {
            let errored = false;
            try {
                const _ignored = await mut8({ src, dataToAddOrPatch: { a: "aaaaa" } });
            } catch (error) {
                errored = true;
            }
            iReckon(sir, errored).isGonnaBeTrue()
        });

        await ifWe(sir, `should fail to mut8 rename data (ib: ${src.ib})`, async () => {
            let errored = false;
            try {
                const _ignored = await mut8({ src, dataToRename: { a: "aaaaa" } });
            } catch (error) {
                errored = true;
            }
            iReckon(sir, errored).isGonnaBeTrue()
        });

        await ifWe(sir, `should fail to mut8 remove data (ib: ${src.ib})`, async () => {
            let errored = false;
            try {
                const _ignored = await mut8({ src, dataToRemove: { a: "aaaaa" } });
            } catch (error) {
                errored = true;
            }
            iReckon(sir, errored).isGonnaBeTrue()
        });
    }
});

await respecfully(sir, `when mutating a regular ibgib`, async () => {

    await respecfully(sir, `with simple, 1-level, non-nested data and ib`, async () => {
        for (const primitive of PRIMITIVE_IBGIBS) {
            for (const testData of DATAS_SIMPLE) {
                // console.log(`doing testdata: ${primitive.ib}.data ~ ${pretty(testData)}`);
                await ifWe(sir, `should add/rename/patch simple data (${primitive.ib}) and ib`, async () => {

                    let { newIbGib: src } = await fork({ src: primitive, noTimestamp: true });

                    // #region add data

                    // we now have a non-primitive source and wish to
                    // add some internal data to it.

                    let { newIbGib: dataAddedIbGib } = await mut8({
                        src,
                        dataToAddOrPatch: testData,
                        noTimestamp: true,
                        linkedRel8ns: ['past'],
                    });
                    let dataAddedAddr: IbGibAddr = getIbGibAddr({ ibGib: dataAddedIbGib });
                    iReckon(sir, dataAddedIbGib).isGonnaBeTruthy();
                    iReckon(sir, dataAddedIbGib.data).isGonnaBeTruthy();
                    iReckon(sir, dataAddedIbGib.data).isGonnaBeTruthy();
                    iReckon(sir, dataAddedIbGib.data).isGonnaBe(testData);
                    iReckon(sir, dataAddedIbGib.rel8ns).isGonnaBeTruthy();
                    iReckon(sir, dataAddedIbGib.rel8ns!.past).isGonnaBeTruthy();
                    iReckon(sir, (dataAddedIbGib.rel8ns!.past || []).length)
                        .asTo('(dataAddedIbGib.rel8ns!.past || []).length')
                        .isGonnaBe(1);

                    // #endregion

                    // #region rename

                    const newNameForX = "new name for x here";
                    const valueForX = dataAddedIbGib.data!.x;
                    const dataToRename = { x: newNameForX }

                    let { newIbGib: dataRenamedIbGib } =
                        await mut8({
                            src: dataAddedIbGib,
                            dataToRename,
                            noTimestamp: true,
                            linkedRel8ns: ['past'],
                        });
                    iReckon(sir, dataRenamedIbGib).isGonnaBeTruthy();
                    iReckon(sir, dataRenamedIbGib.data).isGonnaBeTruthy();
                    iReckon(sir, dataRenamedIbGib.data).isGonnaBeTruthy();
                    iReckon(sir, dataRenamedIbGib.rel8ns).isGonnaBeTruthy();
                    iReckon(sir, dataRenamedIbGib.rel8ns!.past).isGonnaBeTruthy();
                    iReckon(sir, (dataRenamedIbGib.rel8ns!.past || []).length)
                        .asTo('dataRenamedIbGib.rel8ns!.past || []).length')
                        .isGonnaBe(1);

                    // the data should have the new key name that we did
                    iReckon(sir, Object.keys(dataRenamedIbGib.data!)).includes(newNameForX);

                    // the data value for that new key name should be the same as before, since we didn't change it
                    iReckon(sir, dataRenamedIbGib.data![newNameForX]).isGonnaBe(valueForX);

                    // the most recent past of the dataRenamed ibGib should be the src's (dataAddedIbGib) address
                    iReckon(sir, dataRenamedIbGib.rel8ns!.past![dataRenamedIbGib.rel8ns!.past!.length - 1]).isGonnaBe(dataAddedAddr);

                    //#endregion

                    // #region patch

                    const newValueForX = 42;
                    const dataToPatch = { x: newValueForX }

                    let { newIbGib: dataPatchedIbGib } =
                        await mut8({ src: dataAddedIbGib, dataToAddOrPatch: dataToPatch, noTimestamp: true });
                    iReckon(sir, dataPatchedIbGib).isGonnaBeTruthy();
                    iReckon(sir, dataPatchedIbGib.data).isGonnaBeTruthy();
                    iReckon(sir, dataPatchedIbGib.data).isGonnaBeTruthy();

                    // value should be changed to the new value
                    iReckon(sir, dataPatchedIbGib.data!.x).isGonnaBe(newValueForX);

                    // the most recent past of the dataRenamed ibGib should be the src's (dataAddedIbGib) address
                    iReckon(sir, dataPatchedIbGib.rel8ns!.past![dataPatchedIbGib.rel8ns!.past!.length - 1]).isGonnaBe(dataAddedAddr);

                    //#endregion

                    // #region remove

                    const dataToRemove = { x: '' }; // just want mapping, value is ignored

                    let { newIbGib: dataRemovedIbGib } =
                        await mut8({ src: dataAddedIbGib, dataToRemove, noTimestamp: true });
                    iReckon(sir, dataRemovedIbGib).isGonnaBeTruthy();
                    iReckon(sir, dataRemovedIbGib.data).isGonnaBeTruthy();
                    iReckon(sir, dataRemovedIbGib.data).isGonnaBeTruthy();

                    // the data value for that new key name should be the same as before, since we didn't change it
                    iReckon(sir, dataRemovedIbGib.data!.x).isGonnaBeUndefined();

                    // the most recent past of the dataRemovedIbGib should be the src's address
                    iReckon(sir, dataRemovedIbGib.rel8ns!.past![dataRemovedIbGib.rel8ns!.past!.length - 1]).isGonnaBe(dataAddedAddr);

                    //#endregion

                    // #region ib

                    let { newIbGib: ibMut8dIbGib } =
                        await mut8({ src: dataAddedIbGib, mut8Ib: NEW_IB, noTimestamp: true });
                    iReckon(sir, ibMut8dIbGib).isGonnaBeTruthy();
                    iReckon(sir, ibMut8dIbGib.ib).isGonnaBe(NEW_IB);

                    //#endregion
                });


                await ifWe(sir, `should be rel8d next mut8`, async () => {
                    const { newIbGib: tjpIbGib } = await fork({
                        src: primitive,
                        destIb: 'some ib yo',
                        tjp: { timestamp: true, uuid: true },
                    });
                    const tjpAddr = getIbGibAddr({ ibGib: tjpIbGib });
                    const tjpAddrGib = getIbAndGib({ ibGibAddr: tjpAddr }).gib;
                    iReckon(sir, tjpIbGib!.data?.uuid).isGonnaBeTruthy();
                    iReckon(sir, tjpIbGib!.data?.isTjp).asTo("isTjp").isGonnaBeTrue()
                    const { newIbGib: hasRel8dTjp } = await mut8({
                        src: tjpIbGib,
                        dataToAddOrPatch: { someData: "not intrinsically pertinent to this test" },
                    });
                    const hasRel8dTjpAddr = getIbGibAddr({ ibGib: hasRel8dTjp });
                    const hasRel8dTjpAddrGib = getIbAndGib({ ibGibAddr: hasRel8dTjpAddr }).gib;
                    iReckon(sir, hasRel8dTjp!.data?.uuid).isGonnaBeTruthy();
                    iReckon(sir, hasRel8dTjp!.data?.isTjp).asTo("isTjp after additional mut8").isGonnaBeUndefined();
                    iReckon(sir, hasRel8dTjp!.rel8ns).asTo("rel8ns").isGonnaBeTruthy();
                    iReckon(sir, hasRel8dTjp!.rel8ns!.tjp).asTo("rel8ns.tjp").isGonnaBeTruthy();
                    iReckon(sir, hasRel8dTjp!.rel8ns!.tjp!.length).asTo("rel8ns.tjp.length").isGonnaBe(1);
                    iReckon(sir, hasRel8dTjp!.rel8ns!.tjp).asTo("rel8ns.tjp include").includes(tjpAddr);

                    // the gib should not just be the hash, since it has a tjp timeline
                    iReckon(sir, hasRel8dTjpAddrGib).includes(tjpAddrGib);

                    // shoe-horning in here some getGibInfo testing...eesh
                    let hasRel8dTjpGibInfo = getGibInfo({ ibGibAddr: hasRel8dTjpAddr }); // via addr
                    iReckon(sir, hasRel8dTjpGibInfo.isPrimitive).isGonnaBeUndefined();
                    iReckon(sir, hasRel8dTjpGibInfo.piecesCount).asTo('pieces count').isGonnaBe(2);
                    const hasRel8dTjpHash = await sha256v1(hasRel8dTjp, '');
                    iReckon(sir, hasRel8dTjpGibInfo.punctiliarHash).asTo('punctiliarHash').isGonnaBe(hasRel8dTjpHash);
                    iReckon(sir, hasRel8dTjpGibInfo.tjpGib).isGonnaBe(tjpAddrGib);
                    // the info should be the same if we get it straight from the gib
                    const hasRel8dTjpGibInfo_viaGib = getGibInfo({ gib: hasRel8dTjpAddrGib }); // via gib
                    iReckon(sir, hasRel8dTjpGibInfo_viaGib).asTo('infos via addr and gib should be equal').isGonnaBe(hasRel8dTjpGibInfo);
                });
            }
        } // double for..of statement
    })

    await respecfully(sir, `...and creating dna`, async () => {
        var src: IbGib_V1, forkDnas: IbGib_V1[],
            // these are used later when reapplying dnas to test pure functionality
            addDna: IbGib_V1, dataAddedIbGib1: IbGib_V1,
            patchDna: IbGib_V1, dataPatchedIbGib1: IbGib_V1,
            renameDna: IbGib_V1, dataRenamedIbGib1: IbGib_V1,
            removeDna: IbGib_V1, dataRemovedIbGib1: IbGib_V1;
        firstOfAll(sir, async () => {
            const resInit = await fork({ src: ROOT, dna: true });
            src = resInit.newIbGib;
            forkDnas = resInit.dnas!;
        })

        await ifWe(sir, `should have well-formed dna...`, async () => {

            // #region data added

            const srcAddr = getIbGibAddr({ ibGib: src });
            const dataToAdd = DATA_SIMPLE_XY;
            const { newIbGib: dataAddedIbGib, dnas: Mut8AddDnas } =
                await mut8({ src, dna: true, dataToAddOrPatch: dataToAdd });
            dataAddedIbGib1 = dataAddedIbGib; // for later testing pure functionality
            const dataAddedAddr = getIbGibAddr({ ibGib: dataAddedIbGib });

            let mut8Dna = Mut8AddDnas![0];
            addDna = mut8Dna;

            iReckon(sir, mut8Dna.ib).asTo(`ib should be mut8`).isGonnaBe('mut8');

            {
                iReckon(sir, mut8Dna?.rel8ns).asTo(`should descend from mut8^gib primitive`).isGonnaBeTruthy();
                const mut8DnaRel8ns: IbGibRel8ns_V1 = mut8Dna?.rel8ns!;
                iReckon(sir, mut8DnaRel8ns.ancestor).asTo(`should descend from mut8^gib primitive`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaRel8ns.ancestor!.length).asTo(`should descend from mut8^gib primitive`).isGonnaBe(1);
                iReckon(sir, mut8DnaRel8ns.ancestor![0]).asTo(`should descend from mut8^gib primitive`).isGonnaBe('mut8^gib');

                const mut8DnaData = (mut8Dna.data as TransformOpts_Mut8<IbGib_V1>)!;

                iReckon(sir, mut8DnaData).asTo(`should have well-formed common transform opts`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaData).asTo(`should have well-formed common transform opts`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaData.dna).asTo(`should have well-formed common transform opts`).isGonnaBeTrue()
                iReckon(sir, mut8DnaData.srcAddr).asTo(`should have well-formed common transform opts`).isGonnaBeUndefined();
                iReckon(sir, mut8DnaData.src).asTo(`should have well-formed common transform opts`).isGonnaBeUndefined();

                iReckon(sir, mut8DnaData.type).asTo(`should have well-formed data specific to type of mut8`).isGonnaBe("mut8");
                iReckon(sir, mut8DnaData.dataToAddOrPatch).asTo(`should have well-formed data specific to type of mut8`).isGonnaBe(dataToAdd);
            }
            // #endregion

            // #region data patched

            {
                const dataToPatch = { z: '3' };
                const { newIbGib: dataPatchedIbGib, dnas: patchedDnas } =
                    await mut8({ src: dataAddedIbGib, dna: true, dataToAddOrPatch: dataToPatch });
                dataPatchedIbGib1 = dataPatchedIbGib; // for later testing pure functionality

                mut8Dna = patchedDnas![0];
                patchDna = mut8Dna;

                iReckon(sir, mut8Dna.ib).asTo(`data patched, ib should be mut8`).isGonnaBe('mut8');
                iReckon(sir, mut8Dna?.rel8ns).asTo(`data patched, should descend from mut8^gib primitive`).isGonnaBeTruthy();
                const mut8DnaRel8ns: IbGibRel8ns_V1 = mut8Dna?.rel8ns!;
                iReckon(sir, mut8DnaRel8ns.ancestor).asTo(`data patched, should descend from mut8^gib primitive`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaRel8ns.ancestor!.length).isGonnaBe(1);
                iReckon(sir, mut8DnaRel8ns.ancestor![0]).isGonnaBe('mut8^gib');

                const mut8DnaData = (mut8Dna.data as TransformOpts_Mut8<IbGib_V1>)!;

                iReckon(sir, mut8DnaData).asTo(`data patched, should have well-formed common transform opts`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaData).asTo(`data patched, should have well-formed common transform opts`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaData.dna).asTo(`data patched, should have well-formed common transform opts`).isGonnaBeTrue()
                iReckon(sir, mut8DnaData.srcAddr).asTo(`data patched, should have well-formed common transform opts`).isGonnaBeUndefined();
                iReckon(sir, mut8DnaData.src).asTo(`data patched, should have well-formed common transform opts`).isGonnaBeUndefined();
                iReckon(sir, mut8DnaData.type).asTo(`data patched, should have well-formed data specific to type of mut8`).isGonnaBe("mut8");
                iReckon(sir, mut8DnaData.dataToAddOrPatch).asTo(`data patched, should have well-formed data specific to type of mut8`).isGonnaBe(dataToPatch);
            }
            // #endregion

            // #region data renamed
            {
                const dataToRename = { x: RENAMED_KEY };
                const { newIbGib: dataRenamedIbGib, dnas: renamedDnas } =
                    await mut8({ src: dataAddedIbGib, dna: true, dataToRename });
                dataRenamedIbGib1 = dataRenamedIbGib; // for later testing pure functionality

                mut8Dna = renamedDnas![0];
                renameDna = mut8Dna;

                iReckon(sir, mut8Dna.ib).asTo(`data renamed, ib should be mut8`).isGonnaBe('mut8');
                iReckon(sir, mut8Dna?.rel8ns).asTo(`data renamed, should descend from mut8^gib primitive`).isGonnaBeTruthy();
                const mut8DnaRel8ns: IbGibRel8ns_V1 = mut8Dna?.rel8ns!;
                iReckon(sir, mut8DnaRel8ns.ancestor).asTo(`data renamed, should descend from mut8^gib primitive`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaRel8ns.ancestor!.length).asTo(`data renamed, should descend from mut8^gib primitive`).isGonnaBe(1);
                iReckon(sir, mut8DnaRel8ns.ancestor![0]).asTo(`data renamed, should descend from mut8^gib primitive`).isGonnaBe('mut8^gib');

                const mut8DnaData = (mut8Dna.data as TransformOpts_Mut8<IbGib_V1>)!;

                iReckon(sir, mut8DnaData).asTo(`data renamed, should have well-formed common transform opts`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaData).asTo(`data renamed, should have well-formed common transform opts`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaData.dna).asTo(`data renamed, should have well-formed common transform opts`).isGonnaBeTrue()
                iReckon(sir, mut8DnaData.srcAddr).asTo(`data renamed, should have well-formed common transform opts`).isGonnaBeUndefined();
                iReckon(sir, mut8DnaData.src).asTo(`data renamed, should have well-formed common transform opts`).isGonnaBeUndefined();

                iReckon(sir, mut8DnaData.type).asTo(`data renamed, should have well-formed data specific to type of mut8`).isGonnaBe("mut8");
                iReckon(sir, mut8DnaData.dataToRename).asTo(`data renamed, should have well-formed data specific to type of mut8`).isGonnaBe(dataToRename);
            }
            // #endregion

            // #region test remove dna

            {
                const dataToRemove = { y: '' }; // value is ignored when removing, just want mapping to key
                const { newIbGib: dataRemovedIbGib, dnas: removedDnas } =
                    await mut8({ src: dataAddedIbGib, dna: true, dataToRemove });
                dataRemovedIbGib1 = dataRemovedIbGib; // for later testing pure functionality

                mut8Dna = removedDnas![0];
                removeDna = mut8Dna;

                iReckon(sir, mut8Dna.ib).asTo(`data removed, ib should be mut8`).isGonnaBe('mut8');
                iReckon(sir, mut8Dna?.rel8ns).asTo(`data removed, should descend from mut8^gib primitive`).isGonnaBeTruthy();
                const mut8DnaRel8ns: IbGibRel8ns_V1 = mut8Dna?.rel8ns!;
                iReckon(sir, mut8DnaRel8ns.ancestor).asTo(`data removed, should descend from mut8^gib primitive`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaRel8ns.ancestor!.length).asTo(`data removed, should descend from mut8^gib primitive`).isGonnaBe(1);
                iReckon(sir, mut8DnaRel8ns.ancestor![0]).asTo(`data removed, should descend from mut8^gib primitive`).isGonnaBe('mut8^gib');

                const mut8DnaData = (mut8Dna.data as TransformOpts_Mut8<IbGib_V1>)!;

                iReckon(sir, mut8DnaData).asTo(`data removed, should have well-formed common transform opts`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaData).asTo(`data removed, should have well-formed common transform opts`).isGonnaBeTruthy();
                iReckon(sir, mut8DnaData.dna).asTo(`data removed, should have well-formed common transform opts`).isGonnaBeTrue()
                iReckon(sir, mut8DnaData.srcAddr).asTo(`data removed, should have well-formed common transform opts`).isGonnaBeUndefined();
                iReckon(sir, mut8DnaData.src).asTo(`data removed, should have well-formed common transform opts`).isGonnaBeUndefined();

                iReckon(sir, mut8DnaData.type).asTo(`data removed, should have well-formed data specific to type of mut8`).isGonnaBe("mut8");
                iReckon(sir, mut8DnaData.dataToRemove).asTo(`data removed, should have well-formed data specific to type of mut8`).isGonnaBe(dataToRemove);
            }

            // #endregion

            // #region pure dna functionality (placed here for code reuse, but slightly icky)

            // we're going to repeat our transforms but using the dnas generated in the previous steps.
            // (kinda like translating a foreign language translation back into the
            // original language and making sure it says the same thing)
            // we should produce an entirely new ibGib, because the first newIbGib was timestamped.
            // but the dna "produced" (recreated) should be exactly the same as our initial dna.

            // timestamp should be different (at least 1 second) making newIbGib2 unique

            // these are the vars from above.
            // let addDna: IbGib_V1, dataAddedIbGib1: IbGib_V1,
            //     patchedDna: IbGib_V1, dataPatchedIbGib1: IbGib_V1,
            //     renamedDna: IbGib_V1, dataRenamedIbGib1: IbGib_V1,
            //     removedDna: IbGib_V1, dataRemovedIbGib1: IbGib_V1;
            {
                await delay(1010); // delay at least 1 second to guarantee UTC timestamp shows +1 second in timestamp
                const optsClone: TransformOpts_Mut8<IbGib_V1> = clone(addDna!.data);
                optsClone.src = src;
                const { newIbGib: newIbGib2, dnas: dnas2 } = await mut8(optsClone);
                iReckon(sir, newIbGib2).asTo(`should be pure add mutation (expect delay)`).isGonnaBeTruthy();
                iReckon(sir, dnas2).asTo(`should be pure add mutation (expect delay)`).isGonnaBeTruthy();
                const dna2 = dnas2![0];

                // dna itself should be exactly the same
                iReckon(sir, dna2).asTo(`should be pure add mutation (expect delay)`).isGonnaBe(addDna);

                // the ibGibs **created** should NOT be the same because of timestamping
                // (and later on, other factors would change like identity and other rel8ns)
                iReckon(sir, newIbGib2.gib).asTo(`should be pure add mutation (expect delay)`).not.isGonnaBe(dataAddedIbGib1.gib);
            }
            {
                await delay(500);
                const optsClone: TransformOpts_Mut8<IbGib_V1> = clone(patchDna!.data);
                optsClone.src = dataAddedIbGib1;
                const { newIbGib: newIbGib2, dnas: dnas2 } = await mut8(optsClone);
                iReckon(sir, newIbGib2).asTo(`should be pure patch mutation (expect delay)`).isGonnaBeTruthy();
                iReckon(sir, dnas2).asTo(`should be pure patch mutation (expect delay)`).isGonnaBeTruthy();
                const dna2 = dnas2![0];

                // dna itself should be exactly the same
                iReckon(sir, dna2).asTo(`should be pure patch mutation (expect delay)`).isGonnaBe(patchDna);

                // the ibGibs **created** should NOT be the same because of timestamping
                // (and later on, other factors would change like identity and other rel8ns)
                iReckon(sir, newIbGib2.gib).asTo(`should be pure patch mutation (expect delay)`).not.isGonnaBe(dataPatchedIbGib1.gib);
            }
            {
                await delay(500);
                const optsClone: TransformOpts_Mut8<IbGib_V1> = clone(renameDna!.data);
                optsClone.src = dataAddedIbGib1;
                const { newIbGib: newIbGib2, dnas: dnas2 } = await mut8(optsClone);
                iReckon(sir, newIbGib2).asTo(`should be pure rename mutation (expect delay)`).isGonnaBeTruthy();
                iReckon(sir, dnas2).asTo(`should be pure rename mutation (expect delay)`).isGonnaBeTruthy();
                const dna2 = dnas2![0];

                // dna itself should be exactly the same
                iReckon(sir, dna2).asTo(`should be pure rename mutation (expect delay)`).isGonnaBe(renameDna);

                // the ibGibs **created** should NOT be the same because of timestamping
                // (and later on, other factors would change like identity and other rel8ns)
                iReckon(sir, newIbGib2.gib).asTo(`should be pure rename mutation (expect delay)`).not.isGonnaBe(dataRenamedIbGib1.gib);
            }
            {
                await delay(500);
                const optsClone: TransformOpts_Mut8<IbGib_V1> = clone(removeDna!.data);
                optsClone.src = dataAddedIbGib1;
                const { newIbGib: newIbGib2, dnas: dnas2 } = await mut8(optsClone);
                iReckon(sir, newIbGib2).asTo(`should be pure remove mutation (expect delay)`).isGonnaBeTruthy();
                iReckon(sir, dnas2).asTo(`should be pure remove mutation (expect delay)`).isGonnaBeTruthy();
                const dna2 = dnas2![0];

                // dna itself should be exactly the same
                iReckon(sir, dna2).asTo(`should be pure remove mutation (expect delay)`).isGonnaBe(removeDna);

                // the ibGibs **created** should NOT be the same because of timestamping
                // (and later on, other factors would change like identity and other rel8ns)
                iReckon(sir, newIbGib2.gib).asTo(`should be pure remove mutation (expect delay)`).not.isGonnaBe(dataRemovedIbGib1.gib);
            }

            // #endregion
        });

    }); // dna

    await respecfully(sir, `with more complex data`, async () => {
        for (const primitive of PRIMITIVE_IBGIBS) {
            await ifWe(sir, `should add/rename/patch (${primitive.ib})`, async () => {

                let { newIbGib: src } = await fork({ src: primitive, noTimestamp: true });

                // #region add data

                // we now have a non-primitive source and wish to
                // add some internal data to it.

                let { newIbGib: dataAddedIbGib } = await mut8({
                    src,
                    dataToAddOrPatch: DATA_COMPLEX_XY_NESTED,
                    noTimestamp: true
                });
                let dataAddedAddr: IbGibAddr = getIbGibAddr({ ibGib: dataAddedIbGib });
                iReckon(sir, dataAddedIbGib).isGonnaBeTruthy();
                iReckon(sir, dataAddedIbGib.data).isGonnaBeTruthy();
                iReckon(sir, dataAddedIbGib.data).isGonnaBeTruthy();
                iReckon(sir, dataAddedIbGib.data).isGonnaBe(DATA_COMPLEX_XY_NESTED);

                // #endregion

                // #region rename

                // since it's freezing already, I suppose today I'll have to code offline...or off stream that is.
                const valueForX = dataAddedIbGib.data!.x;
                const dataToRename = {
                    nested1: { [RENAME_ME_KEY]: RENAMED_KEY }
                };

                let { newIbGib: dataRenamedIbGib } =
                    await mut8({ src: dataAddedIbGib, dataToRename, noTimestamp: true });
                // let dataRenamedAddr: IbGibAddr = getIbGibAddr({ibGib: dataRenamedIbGib});
                iReckon(sir, dataRenamedIbGib).isGonnaBeTruthy();
                iReckon(sir, dataRenamedIbGib.data).isGonnaBeTruthy();
                iReckon(sir, dataRenamedIbGib.data).isGonnaBeTruthy();

                // the data should have the new key name that we did
                iReckon(sir, dataRenamedIbGib.data!.nested1).isGonnaBeTruthy();
                iReckon(sir, dataRenamedIbGib.data!.nested1![RENAME_ME_KEY]).isGonnaBeUndefined();
                iReckon(sir, dataRenamedIbGib.data!.nested1![RENAMED_KEY]).isGonnaBeTruthy();

                // the data value for that new key name should be the same as before, since we didn't change it
                iReckon(sir, dataRenamedIbGib.data!.nested1![RENAMED_KEY]).isGonnaBe(RENAME_VALUE);

                // the most recent past of the dataRenamed ibGib should be the src's (dataAddedIbGib) address
                iReckon(sir, dataRenamedIbGib.rel8ns!.past![dataRenamedIbGib.rel8ns!.past!.length - 1]).isGonnaBe(dataAddedAddr);

                //#endregion

                // #region patch

                const newValueForX = 42;
                const dataToPatch = { xyObj: { x: newValueForX } };

                let { newIbGib: dataPatchedIbGib } =
                    await mut8({ src: dataAddedIbGib, dataToAddOrPatch: dataToPatch, noTimestamp: true });
                iReckon(sir, dataPatchedIbGib).isGonnaBeTruthy();
                iReckon(sir, dataPatchedIbGib.data).isGonnaBeTruthy();
                iReckon(sir, dataPatchedIbGib.data).isGonnaBeTruthy();
                iReckon(sir, dataPatchedIbGib.data!.xyObj).isGonnaBeTruthy();

                // value should be changed to the new value
                iReckon(sir, dataPatchedIbGib.data!.xyObj!.x).isGonnaBe(newValueForX);

                // the most recent past of the dataRenamed ibGib should be the src's (dataAddedIbGib) address
                iReckon(sir, dataPatchedIbGib.rel8ns!.past![dataPatchedIbGib.rel8ns!.past!.length - 1]).isGonnaBe(dataAddedAddr);

                //#endregion

                // #region remove

                const dataToRemove = { xyObj: { x: '' } }; // just want mapping, value is ignored

                let { newIbGib: dataRemovedIbGib } =
                    await mut8({ src: dataAddedIbGib, dataToRemove, noTimestamp: true });
                iReckon(sir, dataRemovedIbGib).isGonnaBeTruthy();
                iReckon(sir, dataRemovedIbGib.data).isGonnaBeTruthy();
                iReckon(sir, dataRemovedIbGib.data).isGonnaBeTruthy();

                // the data value for that new key name should be the same as before, since we didn't change it
                iReckon(sir, dataRemovedIbGib.data!.xyObj).isGonnaBeTruthy();
                iReckon(sir, dataRemovedIbGib.data!.xyObj!.x).isGonnaBeUndefined();

                // the most recent past of the dataRemovedIbGib should be the src's address
                iReckon(sir, dataRemovedIbGib.rel8ns!.past![dataRemovedIbGib.rel8ns!.past!.length - 1]).isGonnaBe(dataAddedAddr);

                //#endregion
            });
        }
    })

    await respecfully(sir, `nCounter`, async () => {
        await ifWe(sir, `should increment existing n counter`, async () => {
            for (const primitive of PRIMITIVE_IBGIBS) {
                let { newIbGib: src_0 } =
                    await fork({ src: primitive, nCounter: true });

                iReckon(sir, src_0.data).isGonnaBeTruthy();
                iReckon(sir, src_0.data).isGonnaBeTruthy();
                iReckon(sir, src_0.data!.n).isGonnaBe(0);

                let { newIbGib: src_1 } =
                    await mut8({
                        src: src_0,
                        dataToAddOrPatch: DATA_SIMPLE_XY,
                        nCounter: true
                    });
                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBe(1);
            }
        });
        await ifWe(sir, `should start new n counter, implicit nCounter falsy`, async () => {
            for (const primitive of PRIMITIVE_IBGIBS) {
                let { newIbGib: src_0 } =
                    await fork({ src: primitive, noTimestamp: true });

                iReckon(sir, src_0.data).isGonnaBeUndefined();

                let { newIbGib: src_1 } =
                    await mut8({
                        src: src_0,
                        dataToAddOrPatch: DATA_SIMPLE_XY,
                        nCounter: true
                    });
                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBe(0);
            }
        });
        await ifWe(sir, `should start new n counter, explicit nCounter falsy`, async () => {
            for (const primitive of PRIMITIVE_IBGIBS) {
                let { newIbGib: src_0 } =
                    await fork({ src: primitive, noTimestamp: true, nCounter: false });

                iReckon(sir, src_0.data).isGonnaBeUndefined();

                let { newIbGib: src_1 } =
                    await mut8({
                        src: src_0,
                        dataToAddOrPatch: DATA_SIMPLE_XY,
                        nCounter: true
                    });
                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data).isGonnaBeTruthy();
                iReckon(sir, src_1.data!.n).isGonnaBe(0);
            }
        });
    });

    await respecfully(sir, `when mut8 with dna`, async () => {
        await ifWe(sir, `should have gibs that is corroborated with getGib`, async () => {
            for (const primitive of PRIMITIVE_IBGIBS) {
                let { newIbGib, intermediateIbGibs, dnas } =
                    await fork({ src: primitive, nCounter: false, dna: true });

                const ibGibs_fork = [newIbGib, ...(intermediateIbGibs ?? []), ...(dnas ?? [])];
                // we now have a non-primitive 1st gen source and wish to
                // add rel8ns in it pointing to other ibGibs.

                let resMut8 =
                    await mut8({
                        src: newIbGib,
                        dataToAddOrPatch: DATA_COMPLEX_XY_NESTED,
                        noTimestamp: true,
                        nCounter: true,
                        dna: true,
                    });

                const ibGibs_mut8 = [resMut8.newIbGib, ...(resMut8.intermediateIbGibs ?? []), ...(resMut8.dnas ?? [])];
                const ibGibs = [...ibGibs_fork, ...ibGibs_mut8];
                for (let i = 0; i < ibGibs.length; i++) {
                    const ibGib = ibGibs[i];
                    const gottenGib = await getGib({ ibGib });
                    iReckon(sir, ibGib.gib).isGonnaBe(gottenGib);
                }
            }
        });
    });
});
