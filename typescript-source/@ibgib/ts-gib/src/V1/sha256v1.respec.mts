/**
 * @module sha256v1
 *
 * Test basic hashing that is used when calculating V1 gib hashes
 * using sha256.
 *
 * NOTE:
 *   This only tests the node implementation, and manual testing
 *   is required for browser until I get some kind of browser testing
 *   going.
 */

import {
    firstOfAll, ifWe, ifWeMight, iReckon, respecfully
} from '@ibgib/helper-gib/dist/respec-gib/respec-gib.mjs';
const maam = `[${import.meta.url}]`, sir = maam;

import { IbGib_V1, IbGibRel8ns_V1 } from './types.mjs';
import { sha256v1, hashToHexCopy } from './sha256v1.mjs';
import { IbGibWithDataAndRel8ns, IbGibRel8ns } from '../types.mjs';
import { getGib, getGibInfo } from './transforms/transform-helper.mjs';


import { Factory_V1 as factory } from './factory.mjs';
import { toNormalizedForHashing } from '../helper.mjs';

// #region Test Data

const enum TestIbs {
    ib = "ib",
    some_test_string_here = "Some test string here.",
}
let testHashes_sha256_strings: { [key: string]: string | undefined } = {
    [TestIbs.ib]: "765DBB8C38A58A5DC019D7B3133DFFB251D643CB291328AD8E86D4F05655E68B",
    [TestIbs.some_test_string_here]: "E9D61315933F1E8ABCEAA51B2CDD711FBF63C82CBF8C359603907E6DED73DB30"
};

const ROOT_IBGIB_ADDR = "ib^gib";
const EMPTY_REL8NS: any = {};
const EMPTY_DATA: any = {};
const UNDEFINED_DATA: undefined = undefined;
const UNDEFINED_REL8NS: undefined = undefined;
const NULL_DATA: null = null;
const NULL_REL8NS: null = null;

const FALSY_REL8NS = [EMPTY_REL8NS, UNDEFINED_REL8NS, NULL_REL8NS];
const FALSY_DATA = [EMPTY_DATA, UNDEFINED_DATA, NULL_DATA];
const FALSY_DATA_REL8NS: { r: IbGibRel8ns, d: any }[] = [];
FALSY_REL8NS.forEach(r => {
    FALSY_DATA.forEach(d => {
        FALSY_DATA_REL8NS.push({ d, r });
    })
})

interface DATA_FLAT_XY { x: number; y: number; }
const DATA_FLAT_XY: DATA_FLAT_XY = { x: 1, y: 2 };
const DATA_FLAT_XY_HASH = "689A8F1DB95402580476E38C264278CE7B1E664320CFB4E9AE8D3A908CF09964";
interface DATA_FLAT_XS { x: number; s: string; }
const DATA_FLAT_XS: DATA_FLAT_XS = { x: 1, s: "string here" };
// const DATA_FLAT_XS_HASH = "ACEB0CC65033DD85216F20CB333FA363F4AF5D601B8FBC053F9C0F10A4D6945F"; // oldbefore normalize added
const DATA_FLAT_XS_HASH = "EEE1367DC05EDA2D46B8BB7978856261256FC1F59A95E453D9EECA22D235EE54";
const REL8NS_SIMPLE: IbGibRel8ns_V1 = {
    past: [ROOT_IBGIB_ADDR],
    ancestor: [ROOT_IBGIB_ADDR],
    dna: [ROOT_IBGIB_ADDR],
    identity: [ROOT_IBGIB_ADDR],
}

// const REL8NS_SIMPLE_HASH = "54E74D958F5413212BFD9A5A692B77B5EAC070E82AEAF860D0EE2CCB6113FAFF"; // old before normalize added
const REL8NS_SIMPLE_HASH = "FA54EECD9FB1B5C9D5FD63E5E59C8C6576D14610DB62129F863B3120F4A1A433";

/**
 * A little dogfooding interface for testing
 */
interface TestData {
    type: "falsy_data_rel8ns" | "simple_data_rel8ns";
    ibgib: IbGibWithDataAndRel8ns;
    ibHash: string;
    dataHash: string;
    rel8nsHash: string;
    salt?: string;
}

const TEST_IBGIBS: TestData[] = [
    ...FALSY_DATA_REL8NS.map(x => {
        return {
            type: "falsy_data_rel8ns",
            ibgib: {
                ib: TestIbs.ib,
                gib: testHashes_sha256_strings.ib,
                rel8ns: x.r,
            },
            ibHash: testHashes_sha256_strings.ib,
            dataHash: "",
            rel8nsHash: "",
        } as TestData;
    }),
    {
        type: "simple_data_rel8ns",
        ibgib: {
            ib: TestIbs.ib,
            // gib: "6B4084CBE160723E10DC14E9B3FC5AFCE537BB41FC00150C5403C2A62D6BE759", // before normalize
            gib: "34F03B3EC694FBEE1F93944CF6BAD4B6A07FD450276B9FC1A523EB4C1E4157B7",
            rel8ns: REL8NS_SIMPLE,
            data: DATA_FLAT_XY,
        },
        ibHash: testHashes_sha256_strings[TestIbs.ib]!,
        rel8nsHash: REL8NS_SIMPLE_HASH,
        dataHash: DATA_FLAT_XY_HASH,
    },
    {
        type: "simple_data_rel8ns",
        ibgib: {
            ib: TestIbs.ib,
            // gib: "A11967196EB5E5F1EC95A5BFA7DD9765B9B060DDAE736F597180BF9D6B53F4ED", // before normalize added
            gib: "577E5732B8E00539B5FBF27607E09496805BB113232C970958D8DF05BE6164B6",
            rel8ns: REL8NS_SIMPLE,
            data: DATA_FLAT_XS,
        },
        ibHash: testHashes_sha256_strings[TestIbs.ib]!,
        rel8nsHash: REL8NS_SIMPLE_HASH,
        dataHash: DATA_FLAT_XS_HASH,
    },
]

// #endregion

await respecfully(sir, `when hashing sha256v1`, async () => {

    await ifWe(sir, `should hash ibgibs with empty/null/undefined data/rel8ns consistently "forever"`, async () => {
        const ib: string = "ib";
        const gib: string = "gib ignored when hashing";
        const ibHash: string = await hashToHexCopy(ib) || "";
        const dataHash: string = "";
        const rel8nsHash: string = "";
        const all = (ibHash + rel8nsHash + dataHash).toUpperCase();
        const manualAllHash = (await hashToHexCopy(all))?.toUpperCase();
        iReckon(sir, manualAllHash).isGonnaBe("E975776B1A3E4468086E1D8C409116F6E098D13BEEDFE17AF668071B5D11CD55");

        const equivalents: IbGib_V1[] = [
            // #region empty rel8ns
            {
                ib, gib,
                rel8ns: EMPTY_REL8NS
            },
            {
                ib, gib,
                rel8ns: EMPTY_REL8NS,
                data: EMPTY_DATA,
            },
            {
                ib, gib,
                rel8ns: EMPTY_REL8NS,
                data: NULL_DATA,
            },
            {
                ib, gib,
                rel8ns: EMPTY_REL8NS,
                data: UNDEFINED_DATA,
            },
            // #endregion
            // #region null rel8ns
            {
                ib, gib,
                rel8ns: NULL_REL8NS,
                data: EMPTY_DATA,
            },
            {
                ib, gib,
                rel8ns: NULL_REL8NS,
                data: NULL_DATA,
            },
            {
                ib, gib,
                rel8ns: NULL_REL8NS,
                data: UNDEFINED_DATA,
            },
            // #endregion
            // #region undefined rel8ns
            {
                ib, gib,
                rel8ns: UNDEFINED_REL8NS,
                data: EMPTY_DATA,
            },
            {
                ib, gib,
                rel8ns: UNDEFINED_REL8NS,
                data: NULL_DATA,
            },
            {
                ib, gib,
                rel8ns: UNDEFINED_REL8NS,
                data: UNDEFINED_DATA,
            },
            // #endregion
        ]
        // someday change this to use the TEST_IBGIBS
        for (let j = 0; j < equivalents.length; j++) {
            const ibgib = equivalents[j];
            const result = (await sha256v1(ibgib, "")).toUpperCase();
            iReckon(sir, result).isGonnaBe(manualAllHash!);
        }
    });

    /**
     * ## 11/2024
     * this tests for durability of the hashing, but I just wanted to note here
     * that I am changing the gib at a low level to use a normalizing algo.
     * since not one single person uses this fargin icehole, I'm not doing
     * anything extra and this is just going to tank the past existing ibgibs.
     * no big deal though I will lose existing b2tfs stuff. but acceptable for
     * now.
     */
    await ifWe(sir, `should hash ibgibs with non-null data/rel8ns consistently "forever"`, async () => {
        for (const x of TEST_IBGIBS.filter(x => x.type === "simple_data_rel8ns")) {
            // compare the gib hash steps used in sha256v1 function. this must
            // be changed if the internals of sha256v1 are changed.
            const ibHash: string = await hashToHexCopy(x.ibgib.ib) || "";
            const dataHash: string = await hashToHexCopy(JSON.stringify(toNormalizedForHashing(x.ibgib.data))) || "";
            iReckon(sir, dataHash.toUpperCase()).isGonnaBe(x.dataHash);
            const rel8nsHash: string = await hashToHexCopy(JSON.stringify(toNormalizedForHashing(x.ibgib.rel8ns))) || "";
            iReckon(sir, rel8nsHash.toUpperCase()).isGonnaBe(x.rel8nsHash);
            const all = (ibHash + rel8nsHash + dataHash).toUpperCase();
            const manualAllHash = (await hashToHexCopy(all))?.toUpperCase();
            iReckon(sir, manualAllHash).isGonnaBe(x.ibgib.gib);

            // compare the gib with the calculated hash via sha256v1 function
            const calculatedGibHash = (await sha256v1(x.ibgib, "")).toUpperCase();
            iReckon(sir, calculatedGibHash).isGonnaBe(x.ibgib.gib!);
        }
    });

    // I have one large-ish sha256 function for gibbing purposes instead of my usual
    // breaking down into multiple smaller functions. This is specifically with having
    // function ibgibs in mind, where the textual code is in the ibgib format
    // (ib, gib, data, rel8ns).
    // (dream where metabootstrapping is better)
    // this is testing a function that is internal to the sha256v1 func.
    // terrible as can be duplicated (i.e. not DRY), but simple albeit fragile testing
    // for now.
    const keyStrings = Object.keys(testHashes_sha256_strings);
    for (let i = 0; i < keyStrings.length; i++) {
        const x = keyStrings[i];
        await ifWe(sir, `test internal hash function ib: ${x}`, async () => {
            const result = await hashToHexCopy(x);
            iReckon(sir, result?.toUpperCase()).isGonnaBe(testHashes_sha256_strings[x]);
        });

    }

});
