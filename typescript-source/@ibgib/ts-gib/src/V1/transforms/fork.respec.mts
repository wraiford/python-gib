/**
 * Test basic fork transforms.
 *
 * A 'fork' transform creates a "new" ibgib datum by taking an existing
 * source ibgib record (src), clones it, appends the source to the list
 * of ancestors, and clears the ibgibs past (if any).
 *
 * Sometimes you want a thing to be unique when it is created (forked).
 * When this is done, you give that first address a special name, kinda
 * like the OPPOSITE of a HEAD revision. This is called the temporal
 * junction point (from Back to the Future II), or just tjp. It's like
 * the "name" of the ibgib's timeline.
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
    ifWeMight, iReckon, respecfully,
    respecfullyDear
} from '@ibgib/helper-gib/dist/respec-gib/respec-gib.mjs';
const maam = `[${import.meta.url}]`, sir = maam;

import { IbGib_V1, IbGibRel8ns_V1, Rel8n } from '../types.mjs';
import { fork } from './fork.mjs';
import { TransformOpts_Fork, IbGibAddr, Ib, TransformResult } from '../../types.mjs';
import { getIbGibAddr, toNormalizedForHashing } from '../../helper.mjs';
import { ROOT, } from '../constants.mjs';
import { mut8 } from './mut8.mjs';
import { getGib } from './transform-helper.mjs';

await respecfully(sir, `when forking the root`, async () => {

    const src = ROOT;

    await ifWe(sir, `should create a new ibgib`, async () => {
        const { newIbGib } = await fork({ src });
        iReckon(sir, newIbGib).isGonnaBeTruthy();
    });

    await ifWe(sir, `should have no rel8ns (because forked from the root)`, async () => {
        const { newIbGib } = await fork({ src });
        iReckon(sir, newIbGib.rel8ns).isGonnaBeUndefined();
    });

    await respecfully(sir, `should respect param`, async () => {
        await ifWe(sir, `noTimestamp`, async () => {
            const { newIbGib } = await fork({ src, noTimestamp: true });
            if (newIbGib?.data) {
                iReckon(sir, newIbGib.data!.timestamp).isGonnaBeUndefined();
            } else {
                // data being falsy is passing so no expect statement needed
            }
        });

        await ifWe(sir, `destIb`, async () => {
            // just an example, ib can be any value/metadata per use case
            // in this example, we have a canonical form tag [tagName]
            // this way, we can just pass around the address (tag like ^ABCD123)
            // and operate on it (the metadata) without having to send the
            // entire data record.
            const destIb = 'tag like';
            const { newIbGib } = await fork({ src, destIb });
            iReckon(sir, newIbGib.ib).isGonnaBe(destIb);
        });

        await ifWe(sir, `dna`, async () => {
            // NOTE: more extensive dna testing is below in other tests
            const destIb = "This will be the new ib";
            const { newIbGib, dnas } = await fork({ src, dna: true, destIb });
            iReckon(sir, dnas).isGonnaBeTruthy();
        });

        await ifWe(sir, `uuid`, async () => {
            const { newIbGib } = await fork({ src, uuid: true });
            iReckon(sir, newIbGib?.data).isGonnaBeTruthy();
            iReckon(sir, newIbGib!.data?.uuid).isGonnaBeTruthy();
        });

        await respecfully(sir, `tjp...`, async () => {
            await ifWe(sir, `timestamp`, async () => {
                const { newIbGib } = await fork({ src, tjp: { timestamp: true } });
                iReckon(sir, newIbGib?.data).isGonnaBeTruthy();
                iReckon(sir, newIbGib!.data?.timestamp).isGonnaBeTruthy();
                iReckon(sir, newIbGib!.data?.timestampMs).isGonnaBeTruthy();
                const testDate = new Date(newIbGib!.data!.timestamp!);
                iReckon(sir, testDate).isGonnaBeTruthy();
                iReckon(sir, testDate).isGonnaBeTruthy();
                iReckon(sir, testDate.toString()).not.isGonnaBe("Invalid Date");
                // counting on environment (node) to be consistent with invalid dates in the future
                const invalidDate = new Date("asdf");
                iReckon(sir, invalidDate.toString()).isGonnaBe("Invalid Date");
                iReckon(sir, newIbGib!.data?.isTjp).asTo("isTjp").isGonnaBeTrue();
            });
            await ifWe(sir, `uuid`, async () => {
                const { newIbGib } = await fork({ src, tjp: { uuid: true } });
                iReckon(sir, newIbGib?.data).isGonnaBeTruthy();
                iReckon(sir, newIbGib!.data?.uuid).isGonnaBeTruthy();
                iReckon(sir, newIbGib!.data?.isTjp).asTo("isTjp").isGonnaBeTrue()
            });
            await ifWe(sir, `timestamp && uuid`, async () => {
                const { newIbGib } = await fork({ src, tjp: { timestamp: true, uuid: true } });
                iReckon(sir, newIbGib?.data).isGonnaBeTruthy();
                iReckon(sir, newIbGib!.data?.timestamp).isGonnaBeTruthy();
                iReckon(sir, newIbGib!.data?.timestampMs).isGonnaBeTruthy();
                const testDate = new Date(newIbGib!.data!.timestamp!);
                iReckon(sir, testDate).isGonnaBeTruthy();
                iReckon(sir, testDate).isGonnaBeTruthy();
                iReckon(sir, testDate.toString()).not.isGonnaBe("Invalid Date");
                iReckon(sir, newIbGib!.data?.uuid).isGonnaBeTruthy();
                iReckon(sir, newIbGib!.data?.isTjp).asTo("isTjp").isGonnaBeTrue()
            });
        });

        await ifWe(sir, `nCounter`, async () => {
            const { newIbGib } = await fork({ src, nCounter: true });
            iReckon(sir, newIbGib?.data).isGonnaBeTruthy();
            iReckon(sir, newIbGib!.data?.n).isGonnaBe(0);
        });


        await ifWe(sir, `cloneRel8ns (setting should be ignored since forking root)`, async () => {
            const { newIbGib } = await fork({ src, cloneRel8ns: true, noTimestamp: true });
            iReckon(sir, newIbGib?.rel8ns).isGonnaBeUndefined();
        });

        await ifWe(sir, `cloneData (setting should be ignored since forking root)`, async () => {
            const { newIbGib } = await fork({ src, cloneData: true, noTimestamp: true });
            iReckon(sir, newIbGib?.data).isGonnaBeUndefined();
        });
    });

    await respecfully(sir, `...and creating dna`, async () => {
        await ifWe(sir, `should have well-formed dna, like...`, async () => {
            const destIb = "This will be the new ib";
            const { newIbGib, intermediateIbGibs, dnas } = await fork({ src, dna: true, destIb });
            const forkDna = dnas![0];

            iReckon(sir, forkDna.ib).asTo(`ib should be fork`).isGonnaBe('fork');

            let ibGibs = [newIbGib, ...(intermediateIbGibs ?? []), ...(dnas ?? [])];
            for (let i = 0; i < ibGibs.length; i++) {
                const ibGib = ibGibs[i];
                let gottenGib = await getGib({ ibGib });
                iReckon(sir, ibGib.gib).asTo(`should have a gib that is corroborated with getGib`).isGonnaBe(gottenGib);
            }

            iReckon(sir, forkDna?.rel8ns).asTo(`should descend from fork^gib primitive`).isGonnaBeTruthy();
            const forkDnaRel8ns: IbGibRel8ns_V1 = forkDna?.rel8ns!;
            iReckon(sir, forkDnaRel8ns.ancestor).asTo(`should descend from fork^gib primitive`).isGonnaBeTruthy();
            iReckon(sir, forkDnaRel8ns.ancestor!.length).asTo(`should descend from fork^gib primitive`).isGonnaBe(1);
            iReckon(sir, forkDnaRel8ns.ancestor![0]).asTo(`should descend from fork^gib primitive`).isGonnaBe('fork^gib');

            const forkDnaData = (forkDna.data as TransformOpts_Fork<IbGib_V1>)!;

            iReckon(sir, forkDna.data).asTo(`should have well-formed common transform opts`).isGonnaBeTruthy();
            iReckon(sir, forkDnaData.dna).asTo(`should have well-formed common transform opts`).isGonnaBeTrue()
            iReckon(sir, forkDnaData.srcAddr).asTo(`should have well-formed common transform opts`).isGonnaBeUndefined();
            iReckon(sir, forkDnaData.src).asTo(`should have well-formed common transform opts`).isGonnaBeUndefined();

            iReckon(sir, forkDnaData.type).asTo(`should have well-formed data specific to fork transform`).isGonnaBe("fork");
            iReckon(sir, forkDnaData.destIb).asTo(`should have well-formed data specific to fork transform`).isGonnaBe(destIb);

            // we're going to do another fork with the same options gotten from the dna
            // (kinda like translating a foreign language translation back into the
            // original language and making sure it says the same thing)
            // we should produce an entirely new ibGib, because the first newIbGib was timestamped.
            // but the dna "produced" (recreated) should be exactly the same as our initial dna.

            // timestamp should be different (at least 1 second) making newIbGib2 unique
            await delay(1100);

            // NOTE: we're getting the new fork args from the **generated dna**, NOT from
            // our initial fork args. This ensures that we're saving all of the required
            // data in the dna record.
            const forkOpts2: TransformOpts_Fork<IbGib_V1> = clone(forkDnaData);
            forkOpts2.src = ROOT;
            const { newIbGib: newIbGib2, dnas: dnas2 } = await fork(forkOpts2);
            iReckon(sir, newIbGib2).asTo(`should produce pure dna function, and non-unique dna (without timestamps, tjp, or uuid) (1s delay)`).isGonnaBeTruthy();
            iReckon(sir, dnas2).asTo(`should produce pure dna function, and non-unique dna (without timestamps, tjp, or uuid) (1s delay)`).isGonnaBeTruthy();
            const forkDna2 = dnas2![0];

            // dna itself should be exactly the same
            iReckon(sir, forkDna2).asTo(`should produce pure dna function, and non-unique dna (without timestamps, tjp, or uuid) (1s delay)`).isGonnaBe(forkDna);

            // the ibGibs **created** should NOT be the same because of timestamping
            // (and later on, other factors would change like identity and other rel8ns)
            iReckon(sir, newIbGib2.gib).asTo(`should produce pure dna function, and non-unique dna (without timestamps, tjp, or uuid) (1s delay)`).not.isGonnaBe(newIbGib.gib);

            // when forking using the same options, the ib should be the same
            iReckon(sir, newIbGib2.ib).asTo(`should produce pure dna function, and non-unique dna (without timestamps, tjp, or uuid) (1s delay)`).isGonnaBe(newIbGib.ib);
        });
    }); // dna

});


await respecfully(sir, `when forking a regular ibgib`, async () => {

    let src: IbGib_V1;
    let srcAddr: IbGibAddr;


    firstOfEach(sir, async () => {
        // This will be the src we're working off of.
        const beforeResult = await fork({ src: ROOT, uuid: true });
        src = beforeResult.newIbGib;

        iReckon(sir, src).isGonnaBeTruthy();
    });

    await ifWe(sir, `should create a new ibgib`, async () => {
        const { newIbGib } = await fork({ src });
        iReckon(sir, newIbGib).isGonnaBeTruthy();
    });

    await ifWe(sir, `should have src ib^gib address in ancestor rel8n`, async () => {
        const { newIbGib } = await fork({ src });
        iReckon(sir, newIbGib?.rel8ns).isGonnaBeTruthy();
        iReckon(sir, newIbGib?.rel8ns).isGonnaBeTruthy();
        iReckon(sir, newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
        iReckon(sir, newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
        iReckon(sir, newIbGib?.rel8ns!.ancestor!.length).isGonnaBe(1);
        srcAddr = getIbGibAddr({ ibGib: src });
        iReckon(sir, newIbGib?.rel8ns!.ancestor![0]).isGonnaBe(srcAddr);
    });

    // TODO: TEST FORK cloneRel8ns option ONCE REL8 IS IMPLEMENTED
    // it(`cloneRel8ns`, async () => {
    //     const testData = {x: 1, y: 2, deeper: { zzz: 333 }};
    //     const { newIbGib: grandparent } = await fork({ src, cloneData: true});
    //     const { newIbGib: parent } = await mut8({ src: grandparent, dataToAddOrPatch: testData });
    //     const { newIbGib } = await fork({ src: parent, cloneData: true});

    //     expect(newIbGib).isGonnaBeTruthy();
    //     expect(newIbGib!.rel8ns).isGonnaBeTruthy();
    //     expect(newIbGib!.rel8ns).isGonnaBeTruthy();
    //     expect(newIbGib!.rel8ns!.ancestor).isGonnaBeTruthy();
    //     expect(newIbGib!.rel8ns!.ancestor).isGonnaBeTruthy();
    //     const parentAddr = getIbGibAddr({ibGib: parent});
    //     expect(newIbGib!.rel8ns!.ancestor![newIbGib!.rel8ns!.ancestor!.length-1]).isGonnaBe(parentAddr);
    //     expect(newIbGib!.data).isGonnaBeTruthy();
    //     expect(newIbGib!.data).isGonnaBe(testData);
    // });

    await ifWe(sir, `cloneData`, async () => {
        // adding uuid/timestamp for testing hack
        // need to reconsider inability to rename/remove timestamp data
        // seems silly since bad actors can always do this and security is
        // really through other means.
        const testData = { x: 1, y: 2, deeper: { zzz: 333 }, uuid: 'tbd', timestamp: 'tbd', timestampMs: -1 };
        const { newIbGib: grandparent } = await fork({ src, cloneData: true, noTimestamp: true });
        testData.uuid = grandparent.data!.uuid!;
        testData.timestamp = grandparent.data!.timestamp!;
        testData.timestampMs = grandparent.data!.timestampMs!;
        const { newIbGib: parent } =
            await mut8({
                src: grandparent,
                dataToAddOrPatch: testData,
                noTimestamp: true
            });
        const { newIbGib } = await fork({ src: parent, cloneData: true, noTimestamp: true });

        iReckon(sir, newIbGib).isGonnaBeTruthy();
        iReckon(sir, newIbGib!.rel8ns).isGonnaBeTruthy();
        iReckon(sir, newIbGib!.rel8ns).isGonnaBeTruthy();
        iReckon(sir, newIbGib!.rel8ns!.ancestor).isGonnaBeTruthy();
        iReckon(sir, newIbGib!.rel8ns!.ancestor).isGonnaBeTruthy();
        const parentAddr = getIbGibAddr({ ibGib: parent });

        iReckon(sir, newIbGib!.rel8ns!.ancestor![newIbGib!.rel8ns!.ancestor!.length - 1]).isGonnaBe(parentAddr);

        iReckon(sir, newIbGib!.data).isGonnaBeTruthy();

        // 12/2024 - ok, I have changed fundamental gib hashing with
        // normalization. this sorts keys and removes 'undefined' values
        iReckon(sir, toNormalizedForHashing(newIbGib!.data)).isGonnaBe(toNormalizedForHashing(testData));
    });
});

await respecfully(sir, `when forking multiple regular ibgibs, NON LINKED REL8NS`, async () => {

    const ibs: Ib[] = ["a", "b", "c", "d"];
    let srcForks: { [ib: string]: TransformResult<IbGib_V1> } = {};
    let srcIbGibs: { [ib: string]: IbGib_V1 } = {};

    firstOfEach(sir, async () => {
        // These will be the srcs we're working off of.
        // a forked from root, b forked from a, etc.
        let prevIbGib: IbGib_V1 | undefined;
        for (let ib of ibs) {
            const forkResult = await fork({ src: prevIbGib || ROOT, destIb: ib });
            srcForks[ib] = forkResult;
            srcIbGibs[ib] = forkResult.newIbGib;
            prevIbGib = forkResult.newIbGib;
        }
    });
    lastOfEach(sir, () => {
        srcForks = {};
        srcIbGibs = {};
    })

    await ifWe(sir, `should create a new ibgib`, async () => {
        ibs.forEach(ib => {
            const ibGib = srcIbGibs[ib];
            iReckon(sir, ibGib).isGonnaBeTruthy();
            iReckon(sir, ibGib).isGonnaBeTruthy();
            iReckon(sir, ibGib.ib).isGonnaBe(ib);
        })
    });

    await ifWe(sir, `should have src ib^gib (address) in ancestor rel8n`, async () => {
        const getPrev: (ib: Ib) => IbGib_V1 | null = (ib) => {
            switch (ib) {
                case "a": return null;
                case "b": return srcIbGibs.a;
                case "c": return srcIbGibs.b;
                case "d": return srcIbGibs.c;
                default: throw new Error("unknown ib")
            }
        };
        // the first one forks from the root, so the rel8ns should be undefined which is tested elsewhere
        ibs.filter(ib => ib !== "a").forEach(ib => {
            const newIbGib = srcIbGibs[ib]!;
            const prevIbGib = getPrev(ib)!;
            iReckon(sir, newIbGib?.rel8ns).isGonnaBeTruthy();
            iReckon(sir, newIbGib?.rel8ns).isGonnaBeTruthy();
            iReckon(sir, newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
            iReckon(sir, newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
            iReckon(sir, newIbGib?.rel8ns!.ancestor!.length > 0).isGonnaBeTrue();
            const prevIbGibAddr = getIbGibAddr({ ibGib: prevIbGib });
            iReckon(sir, newIbGib?.rel8ns!.ancestor![newIbGib!.rel8ns!.ancestor!.length - 1]).isGonnaBe(prevIbGibAddr);
        })
    });

    // TODO: need to implement mut8 before the clone data can be tested
    // it(`should clone data`, async () => {
    //     throw new Error('not implemented yet');
    //     const testData = { yo: "there" }
    //     const { newIbGib } = await fork({ src });
    //     expect(newIbGib?.rel8ns).isGonnaBeTruthy();
    //     expect(newIbGib?.rel8ns).isGonnaBeTruthy();
    //     expect(newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
    //     expect(newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
    //     expect(newIbGib?.rel8ns!.ancestor!.length).isGonnaBe(1);
    //     srcAddr = getIbGibAddr({ibGib: src});
    //     expect(newIbGib?.rel8ns!.ancestor![0]).isGonnaBe(srcAddr);
    // });
});

await respecfully(sir, `when forking with YES LINKED 'ancestor' rel8n...`, async () => {

    const ibs: Ib[] = ["a", "b", "c", "d"];
    let srcForks: { [ib: string]: TransformResult<IbGib_V1> } = {};
    let srcIbGibs: { [ib: string]: IbGib_V1 } = {};

    firstOfEach(sir, async () => {
        // These will be the srcs we're working off of.
        // a forked from root, b forked from a, etc.
        let prevIbGib: IbGib_V1 | undefined;
        for (let i = 0; i < ibs.length; i++) {
            const ib = ibs[i];
            const forkResult = await fork({
                src: prevIbGib || ROOT,
                destIb: ib,
                linkedRel8ns: [Rel8n.ancestor],
            });
            srcForks[ib] = forkResult;
            srcIbGibs[ib] = forkResult.newIbGib;
            prevIbGib = forkResult.newIbGib;

        }
    });
    lastOfEach(sir, () => {
        srcForks = {};
        srcIbGibs = {};
    })

    await ifWe(sir, `should create a new ibgib`, async () => {
        ibs.forEach(ib => {
            const ibGib = srcIbGibs[ib];
            iReckon(sir, ibGib).isGonnaBeTruthy();
            iReckon(sir, ibGib).isGonnaBeTruthy();
            iReckon(sir, ibGib.ib).isGonnaBe(ib);
        })
    });

    await ifWe(sir, `should have src ib^gib (address) in ancestor rel8n`, async () => {
        const getPrevIbGib: (ib: Ib) => IbGib_V1 | null = (ib) => {
            switch (ib) {
                case "a": return null;
                case "b": return srcIbGibs.a;
                case "c": return srcIbGibs.b;
                case "d": return srcIbGibs.c;
                default: throw new Error("unknown ib")
            }
        };
        // the first one forks from the root, so the rel8ns should be undefined which is tested elsewhere
        ibs.filter(ib => ib === "a").forEach(ib => {
            const newIbGib = srcIbGibs[ib]!;
            iReckon(sir, newIbGib?.rel8ns).isGonnaBeUndefined();
            // expect(newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
            // expect(newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
            // expect(newIbGib?.rel8ns!.ancestor!.length).isGonnaBe(1);
            // const prevIbGibAddr = getIbGibAddr({ibGib: prevIbGib});
            // expect(newIbGib?.rel8ns!.ancestor![0]).isGonnaBe(prevIbGibAddr);
        });
        ibs.filter(ib => ib !== "a").forEach(ib => {
            const newIbGib = srcIbGibs[ib]!;
            const prevIbGib = getPrevIbGib(ib)!;
            iReckon(sir, newIbGib?.rel8ns).isGonnaBeTruthy();
            iReckon(sir, newIbGib?.rel8ns).isGonnaBeTruthy();
            iReckon(sir, newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
            iReckon(sir, newIbGib?.rel8ns!.ancestor).isGonnaBeTruthy();
            iReckon(sir, newIbGib?.rel8ns!.ancestor!.length).isGonnaBe(1);
            const prevIbGibAddr = getIbGibAddr({ ibGib: prevIbGib });
            iReckon(sir, newIbGib?.rel8ns!.ancestor![0]).isGonnaBe(prevIbGibAddr);
        });
    });

});
