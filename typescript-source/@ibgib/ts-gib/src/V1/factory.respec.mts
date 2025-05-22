import { IbGib_V1, } from './types.mjs';
import { IbGibRel8ns } from '../types.mjs';
import { getIbGibAddr } from '../helper.mjs';
import { ROOT, } from './constants.mjs';
import { Factory_V1 as factory } from './factory.mjs';
import { sha256v1 } from './sha256v1.mjs';
import { getGib, getGibInfo } from './transforms/transform-helper.mjs';
import { firstOfAll, ifWe, iReckon, respecfully } from '@ibgib/helper-gib/dist/respec-gib/respec-gib.mjs';
const maam = `[${import.meta.url}]`, sir = maam;

const PRIMITIVE_IBS: string[] = [
    'a', '7', 'tag',
    'any string/value that isnt hashed with a gib is a primitive',
    // e.g. 6 -> 6^ -> 6^gib are all equivalent ib^gib addresses,
];


const DATA_SIMPLE_XY = { x: 1, y: 2 };

const SIMPLE_REL8N_NAMES: string[] = [
    // just some possible example rel8n names
    'child', 'container', 'folder', 'identity', 'tag', 'liked'
];


await respecfully(sir, `when using factory`, async () => {

    await ifWe(sir, `primitives() should make multiple ibgibs`, async () => {
        const primitiveIbGibs = factory.primitives({ ibs: PRIMITIVE_IBS });
        iReckon(sir, primitiveIbGibs).isGonnaBeTruthy();
        iReckon(sir, primitiveIbGibs.length).isGonnaBe(PRIMITIVE_IBS.length);
    });

    await respecfully(sir, `firstGen`, async () => {
        await ifWe(sir, `should make an ibgib`, async () => {
            const testIb = 'some ib here';
            const { newIbGib } = await factory.firstGen({
                ib: testIb,
                parentIbGib: ROOT,
            });
            iReckon(sir, newIbGib).isGonnaBeTruthy;
        });
        await ifWe(sir, `should make ibgibs with initial data`, async () => {
            const testIb = 'some ib here';
            const { newIbGib, intermediateIbGibs } = await factory.firstGen({
                ib: testIb,
                parentIbGib: ROOT,
                data: DATA_SIMPLE_XY,
                noTimestamp: true,
            });
            iReckon(sir, newIbGib.data).asTo(`newIbGib.data`).isGonnaBeTruthy();
            iReckon(sir, newIbGib.data).isGonnaBe(DATA_SIMPLE_XY);

            // an intermediate ibGib should be created with
            // the same ib, but not yet mutated with the data.
            iReckon(sir, intermediateIbGibs).asTo(`intermediateIbGibs`).isGonnaBeTruthy();
            iReckon(sir, intermediateIbGibs!.length).isGonnaBe(1);
            iReckon(sir, intermediateIbGibs![0].ib).isGonnaBe(testIb);
            iReckon(sir, intermediateIbGibs![0].data).asTo(`intermediateIbGibs[0].data`).not.isGonnaBeTruthy();
        });
        await ifWe(sir, `should make ibgibs with initial data & rel8ns`, async () => {
            const primitiveIbgibAddrs =
                factory
                    .primitives({ ibs: PRIMITIVE_IBS })
                    .map(ibGib => getIbGibAddr({ ibGib }));

            const testRel8ns: IbGibRel8ns = {};
            SIMPLE_REL8N_NAMES.forEach(rel8nName => {
                testRel8ns[rel8nName] = primitiveIbgibAddrs;
            });
            const testIb = 'some ib here';
            const { newIbGib, intermediateIbGibs } = await factory.firstGen({
                ib: testIb,
                parentIbGib: ROOT,
                data: DATA_SIMPLE_XY,
                noTimestamp: true,
                rel8ns: testRel8ns,
            });
            iReckon(sir, newIbGib.data).asTo(`newIbGib.data`).isGonnaBeTruthy();
            iReckon(sir, newIbGib.data).isGonnaBe(DATA_SIMPLE_XY);
            iReckon(sir, newIbGib.rel8ns).asTo(`newIbGib.rel8ns`).isGonnaBeTruthy();
            SIMPLE_REL8N_NAMES.forEach(rel8nName => {
                iReckon(sir, newIbGib.rel8ns![rel8nName]).isGonnaBe(primitiveIbgibAddrs);
            })

            // an intermediate ibGib should be created with
            // the same ib, but not yet mutated with the data.
            iReckon(sir, intermediateIbGibs).asTo(`intermediateIbGibs`).isGonnaBeTruthy();
            iReckon(sir, intermediateIbGibs!.length).isGonnaBe(2);
            iReckon(sir, intermediateIbGibs![0].ib).isGonnaBe(testIb);
            iReckon(sir, intermediateIbGibs![1].ib).isGonnaBe(testIb);
        });



    });

    await respecfully(sir, 'hmm how to do this?', async () => {
        var allIbGibs: IbGib_V1[];
        firstOfAll(sir, async () => {
            // I'm having some weird discrepancies between calling `sha256v1` and
            // `getGib` (which itself calls sha256v1 supposedly).
            //
            // SOLUTION: these "weird" discrepancies were major bugs...how in the
            // world it's been going this long, I don't know. Good God...
            // anyway, I was calculating the gib in the fork and rel8 transforms
            // before adding the dna to the rel8ns. I have no idea how I didn't catch
            // this earlier!
            let badIbGib: IbGib_V1 = {
                "ib": "comment ff1at755",
                "gib": "CA4B24EE80C62A781379B263BCBF1F6C68DDA53D67C9195213635A8C08CDBA45",
                "rel8ns": {
                    "ancestor": [
                        "comment^gib"
                    ],
                    "dna": [
                        "fork^846B2C9498D4AE906D235DFCFA31C8E71089A93AF1950849F67430468FF36B92"
                    ]
                },
                "data": {
                    "n": 0,
                    "timestamp": "Fri, 18 Feb 2022 13:56:01 GMT",
                    "uuid": "c4773e052dedc808dcc932d371e724bc4d47410d6833b95b8bd0e403adb6f4b3",
                    "isTjp": true
                }
            };

            const text = "ff1 at 755";
            const data: any = { text, textTimestamp: "Fri, 18 Feb 2022 13:56:01 GMT" };

            // create an ibgib with the filename and ext
            const opts: any = {
                parentIbGib: factory.primitive({ ib: 'comment' }),
                ib: badIbGib.ib,
                data,
                dna: true,
                tjp: { uuid: true, timestamp: true },
                nCounter: true,
            };

            const resCommentIbGib = await factory.firstGen(opts);
            allIbGibs = [
                resCommentIbGib!.newIbGib,
                ...resCommentIbGib.intermediateIbGibs!,
                ...resCommentIbGib.dnas!
            ];
        });

        await ifWe(sir, 'should match up ibGib.gib and getGib & should match up sha256v1 hash and punctiliar hash', async () => {
            for (let i = 0; i < allIbGibs.length; i++) {
                const x = allIbGibs[i];
                let hash_sha256v1Direct = await sha256v1(x, '');
                let hash_getGib = await getGib({ ibGib: x });
                let punctiliarHash = getGibInfo({ gib: hash_getGib }).punctiliarHash;
                iReckon(sir, hash_getGib).asTo('hash_getGib does not equal x.gib').isGonnaBe(x.gib!);
                iReckon(sir, hash_sha256v1Direct).isGonnaBe(punctiliarHash!);
            }
        });
    });

});
