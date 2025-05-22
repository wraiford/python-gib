import { ifWe, ifWeMight, iReckon, respecfully } from '@ibgib/helper-gib/dist/respec-gib/respec-gib.mjs';
const maam = `[${import.meta.url}]`, sir = maam;

import { getIbAndGib, getIbGibAddr, toNormalizedForHashing } from './helper.mjs';
import { Ib, IbGib } from './types.mjs';
import { ROOT, ROOT_ADDR } from './V1/constants.mjs';


await respecfully(sir, `getIbGibAddr`, async () => {
    // unsure if these would change when not in V1...(these tests are outside V1 atow)

    await ifWe(sir, `should get the right addr for ROOT`, async () => {
        let ibGib = ROOT;
        let gotten = getIbGibAddr({ ibGib });
        iReckon(sir, gotten).isGonnaBeTruthy();
        iReckon(sir, gotten).isGonnaBe(ROOT_ADDR);
    });

    await ifWe(sir, `should get the right addr for primitives`, async () => {
        let ibs: Ib[] = ['7', 'foo', 'ibgib', 'wakka doodle'];
        for (let i = 0; i < ibs.length; i++) {
            const ib = ibs[i];
            let ibGib: IbGib = { ib, gib: 'gib' };
            let gotten = getIbGibAddr({ ibGib });
            iReckon(sir, gotten).isGonnaBeTruthy();
            iReckon(sir, gotten).isGonnaBe(`${ib}^gib`);
        }
    });

});

await respecfully(sir, `getIbAndGib`, async () => {
    // unsure if these would change when not in V1...(these tests are outside V1 atow)

    await ifWe(sir, `should get the right ib & gib for ROOT, with ibGib param`, async () => {
        let ibGib = ROOT;
        let gotten = getIbAndGib({ ibGib });
        iReckon(sir, gotten).isGonnaBeTruthy();
        iReckon(sir, gotten.ib).isGonnaBe('ib');
        iReckon(sir, gotten.gib).isGonnaBe('gib');
    });

    await ifWe(sir, `should get the right ib & gib for ROOT_ADDR, with ibGibAddr param`, async () => {
        let gotten = getIbAndGib({ ibGibAddr: ROOT_ADDR });
        iReckon(sir, gotten).isGonnaBeTruthy();
        iReckon(sir, gotten.ib).isGonnaBe('ib');
        iReckon(sir, gotten.gib).isGonnaBe('gib');
    });

    await ifWe(sir, `should get the right ib & gib for primitives`, async () => {
        let ibs: Ib[] = ['7', 'foo', 'ibgib', 'wakka doodle'];
        for (let i = 0; i < ibs.length; i++) {
            const ib = ibs[i];
            let ibGib: IbGib = { ib, gib: 'gib' };
            let gotten = getIbAndGib({ ibGib });
            iReckon(sir, gotten).isGonnaBeTruthy();
            iReckon(sir, gotten.ib).isGonnaBe(ib);
            iReckon(sir, gotten.gib).isGonnaBe('gib');
        }
    });

});

await respecfully(sir, `normalize object testing for deterministic hashing`, async () => {
    await ifWe(sir, `null, '', {}, undefined, [], etc...`, async () => {
        [
            null,
            '',
            {},
            undefined,
            [],
            'some string',
        ].forEach(obj1 => {
            const normalized1 = toNormalizedForHashing(obj1);
            iReckon(sir, JSON.stringify(obj1))
                .asTo("Original object should not be modified.")
                .isGonnaBe(JSON.stringify(normalized1));
        });
    });

    await ifWe(sir, `flat (sort and undefined)`, async () => {
        // test cases with varying key orders and undefined values
        const obj1 = { a: 1, b: 2, c: undefined };
        const obj2 = { c: undefined, b: 2, a: 1 };
        const obj3 = { a: 1, b: 2 };

        // check original object state before normalization
        const originalObj1String = JSON.stringify(obj1);

        // normalize the objects
        const normalized1 = toNormalizedForHashing(obj1);
        const normalized2 = toNormalizedForHashing(obj2);
        const normalized3 = toNormalizedForHashing(obj3);

        // check original object state after normalization to ensure it's unchanged
        iReckon(sir, JSON.stringify(obj1)).asTo("Original object should not be modified.").isGonnaBe(originalObj1String);

        // convert to JSON strings for easy comparison of normalized objects
        const json1 = JSON.stringify(normalized1);
        const json2 = JSON.stringify(normalized2);
        const json3 = JSON.stringify(normalized3);

        // assertions for normalization
        iReckon(sir, json1).asTo("Objects with different key orders should normalize to the same string.").isGonnaBe(json2);
        iReckon(sir, json1).asTo("Object with undefined should normalize to the same string as without that key.").isGonnaBe(json3);

        // parse normalized strings back into objects and re-normalize
        const parsedNormalized1 = toNormalizedForHashing(JSON.parse(json1));
        const parsedNormalized2 = toNormalizedForHashing(JSON.parse(json2));
        const parsedNormalized3 = toNormalizedForHashing(JSON.parse(json3));

        // sanity check
        iReckon(sir, parsedNormalized1).asTo("parsedNormalized1 truthy").isGonnaBeTruthy();
        iReckon(sir, parsedNormalized2).asTo("parsedNormalized2 truthy").isGonnaBeTruthy();
        iReckon(sir, parsedNormalized3).asTo("parsedNormalized3 truthy").isGonnaBeTruthy();

        // check if re-normalized objects produce the same string as the original normalized objects
        iReckon(sir, obj1.a).asTo("parsed object `a` property is the same as original object").isGonnaBe(parsedNormalized1["a"]);
        iReckon(sir, JSON.stringify(parsedNormalized1) === json1).asTo("Re-normalized object should produce the same string as the original normalized object.").isGonnaBeTrue();
        iReckon(sir, JSON.stringify(parsedNormalized2) === json2).asTo("Re-normalized object should produce the same string as the original normalized object.").isGonnaBeTrue();
        iReckon(sir, JSON.stringify(parsedNormalized3) === json3).asTo("Re-normalized object should produce the same string as the original normalized object.").isGonnaBeTrue();
    });

    await ifWe(sir, `nested (sort and undefined)`, async () => {
        // test with nested objects
        const nested1 = { a: { z: 1, y: 2 }, b: 3, c: undefined };
        const nested2 = { b: 3, a: { y: 2, z: 1 } };

        // normalize nested objects
        const normalizedNested1 = toNormalizedForHashing(nested1);
        const normalizedNested2 = toNormalizedForHashing(nested2);

        // compare the original and normalized objects' properties
        iReckon(sir, normalizedNested1.a?.z).asTo("nested object `a.z` property is the same as original object").isGonnaBe(nested1.a.z);
        iReckon(sir, normalizedNested1.a?.y).asTo("nested object `a.y` property is the same as original object").isGonnaBe(nested1.a.y);
        iReckon(sir, normalizedNested1.b).asTo("nested object `b` property is the same as original object").isGonnaBe(nested1.b);
        iReckon(sir, normalizedNested1.c).asTo("nested object `c` property is the same as original object").isGonnaBe(nested1.c);

        // check if nested objects are normalized correctly
        iReckon(sir, JSON.stringify(normalizedNested1)).asTo("Nested objects should normalize to the same string.").isGonnaBe(JSON.stringify(normalizedNested2));
    });
});
