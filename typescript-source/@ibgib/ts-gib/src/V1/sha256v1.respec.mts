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
import { IbGibWithDataAndRel8ns, IbGibRel8ns } from '../types.mjs'; // IbGibRel8ns may be unused
import { getGib, getGibInfo } from './transforms/transform-helper.mjs'; // getGib, getGibInfo seem unused in new tests


import { Factory_V1 as factory } from './factory.mjs'; // factory seems unused in new tests
import { toNormalizedForHashing, getJsonReplacer_SortKeys } from '../helper.mjs';

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


await respecfully(sir, `Python Edge Case Tests for sha256v1`, async () => {

    const EMPTY_HASH_FOR_ABSENT_FIELD = "";

    await ifWe(sir, `Edge Case 1: data with mixed undefined and empty string values`, async () => {
        const ibGib_s1: IbGib_V1 = {
            ib: 's1',
            data: { a: undefined, b: '', c: 'val', d: { d1: undefined, d2: 'd2val' } }
        };

        const expected_ib_hash_s1 = "E8BC163C82EEE18733288C7D4AC636DB3A6DEB013EF2D37B68322BE20EDC45CC";
        const expected_data_hash_s1 = "3310C5015C3426C4EC62CF5F5F3EC5D83F86C26E54C5AC3BD05C1B574B46ADE2";
        const expected_gib_s1 = "9B9D08F270C5249FD1DC2E0453010EBD544C7781FF5CDAFADD7679C2C7DA7247";

        const ibHash_ts = (await hashToHexCopy(ibGib_s1.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s1`).isGonnaBe(expected_ib_hash_s1);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s1.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s1`).isGonnaBe(expected_data_hash_s1);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + "" + data_hash)
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s1 (from py test logic)`).isGonnaBe(expected_gib_s1);

        const calculatedGib_ts = (await sha256v1(ibGib_s1, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s1 (from sha256v1 call)`).isGonnaBe(expected_gib_s1);
    });

    await ifWe(sir, `Edge Case 2: rel8ns with a relation mapping to a list containing null`, async () => {
        const ibGib_s2: IbGib_V1 = {
            ib: 's2',
            rel8ns: { next: ['addr1', null, 'addr2'], prev: undefined }
        };

        const expected_ib_hash_s2 = "AD328846AA18B32A335816374511CAC1063C704B8C57999E51DA9F908290A7A4";
        const expected_rel8ns_hash_s2 = "32945B4CE582D29827CA925DCA3155CA397C132F0DB1DB5DFF9AD46A8EFD98FE";
        const expected_gib_s2 = "8DD27B4AFBE3AD7D59768CB4D1A574DC2FEA19546E922101FED6F6ECA9B97C61";

        const ibHash_ts = (await hashToHexCopy(ibGib_s2.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s2`).isGonnaBe(expected_ib_hash_s2);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s2.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s2`).isGonnaBe(expected_rel8ns_hash_s2);

        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + rel8ns_hash + "")
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s2 (from py test logic)`).isGonnaBe(expected_gib_s2);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s2, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s2 (from sha256v1 call)`).isGonnaBe(expected_gib_s2);
    });

    await ifWe(sir, `Edge Case 3: data is an empty list []`, async () => {
        const ibGib_s3: IbGib_V1 = { ib: 's3', data: [] };

        const expected_ib_hash_s3 = "41242B9FAE56FAD4E6E77DFE33CB18D1C3FC583F988CF25EF9F2D9BE0D440BBB";
        const expected_data_hash_s3 = "4F53CDA18C2BAA0C0354BB5F9A3ECBE5ED12AB4D8E11BA873C2F11161202B945";
        const expected_gib_s3 = "BA109F5B0C09CF0A27EF976F876EE8F336DC954EF6443F324F19D78020E3E59A";

        const ibHash_ts = (await hashToHexCopy(ibGib_s3.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s3`).isGonnaBe(expected_ib_hash_s3);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s3.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s3`).isGonnaBe(expected_data_hash_s3);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s3 (from py test logic)`).isGonnaBe(expected_gib_s3);

        const calculatedGib_ts = (await sha256v1(ibGib_s3, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s3 (from sha256v1 call)`).isGonnaBe(expected_gib_s3);
    });

    await ifWe(sir, `Edge Case 4: data contains a list with dictionaries, where inner dicts have null values`, async () => {
        const ibGib_s4: IbGib_V1 = {
            ib: 's4',
            data: { items: [{ id: 1, val: null, name: 'item1' }, { id: 2, val: 'present' }] }
        };

        const expected_ib_hash_s4 = "5B840157E7E86AEF3B3FD0FC24F3ADD34D3E7F210370D429475ED1BCD3E7FCA2";
        const expected_data_hash_s4 = "2682A15F60291F933B57EE14F0A3D5FD233FC90B3FF1ADD5FD473F859FA6B287";
        const expected_gib_s4 = "2AE26C6F9A4D53CE32A0A1792E59F34126A25503CE33728EA7CB8A38E29DD0BF";

        const ibHash_ts = (await hashToHexCopy(ibGib_s4.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s4`).isGonnaBe(expected_ib_hash_s4);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s4.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s4`).isGonnaBe(expected_data_hash_s4);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s4 (from py test logic)`).isGonnaBe(expected_gib_s4);

        const calculatedGib_ts = (await sha256v1(ibGib_s4, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s4 (from sha256v1 call)`).isGonnaBe(expected_gib_s4);
    });

    await ifWe(sir, `Edge Case 5: data key order vs. rel8ns key order`, async () => {
        const ibGib_s5: IbGib_V1 = {
            ib: 's5',
            data: { z: 1, a: 2 },
            rel8ns: { z_rel: ['z1'], a_rel: ['a1'] }
        };

        const expected_ib_hash_s5 = "3B96FC064FA874A80A132BDA60BEBF54EFBC780A358FDCAE4FBBD7E12B66B630";
        const expected_data_hash_s5 = "C2985C5BA6F7D2A55E768F92490CA09388E95BC4CCCB9FDF11B15F4D42F93E73";
        const expected_rel8ns_hash_s5 = "3C0705B51593C740738A0BFB4D9030C8A8093D8A6049346E823CD033BAAA09E5";
        const expected_gib_s5 = "7AC6FB16BC853C6AE7D375ECEEA810ABB6F60241A1679ADEE4DC6ED4E29BE74A";

        const ibHash_ts = (await hashToHexCopy(ibGib_s5.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s5`).isGonnaBe(expected_ib_hash_s5);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s5.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s5`).isGonnaBe(expected_data_hash_s5);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s5.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s5`).isGonnaBe(expected_rel8ns_hash_s5);
        
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s5 (from py test logic)`).isGonnaBe(expected_gib_s5);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s5, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s5 (from sha256v1 call)`).isGonnaBe(expected_gib_s5);
    });

    await ifWe(sir, `Edge Case 6: data with special characters in string values and keys`, async () => {
        const ibGib_s6: IbGib_V1 = {
            ib: 's6',
            data: { 'key "1"': 'value with "quotes" and \n newline', 'key_ñ': 'val_ü' }
        };

        const expected_ib_hash_s6 = "71E7690959239CA065841EBA3EBB281072BAA78BA0BB31079B9ACB4A009A9FE3";
        const expected_data_hash_s6 = "441200D475E6171CD94518A7AD358C29281DBD962163EE7F1B309058098CECE7";
        const expected_gib_s6 = "9AF9BE9284CFCE565CBFD482EA0797E0D67CCD0AEDF6509BCEA3B9D4D00931BF";

        const ibHash_ts = (await hashToHexCopy(ibGib_s6.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s6`).isGonnaBe(expected_ib_hash_s6);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s6.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s6`).isGonnaBe(expected_data_hash_s6);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s6 (from py test logic)`).isGonnaBe(expected_gib_s6);

        const calculatedGib_ts = (await sha256v1(ibGib_s6, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s6 (from sha256v1 call)`).isGonnaBe(expected_gib_s6);
    });

    await ifWe(sir, `Edge Case 7a: data is a primitive type (boolean True)`, async () => {
        const ibGib_s7a: IbGib_V1 = { ib: 's7a', data: true };

        const expected_ib_hash_s7a = "612A9EB864ED62C258BDCB155F13F590879BA34AD30DDE91CB9BE38139439E9F";
        const expected_data_hash_s7a = "B5BEA41B6C623F7C09F1BF24DCAE58EBAB3C0CDD90AD966BC43A45B44867E12B";
        const expected_gib_s7a = "53BBABB9F24C75E3C6037D744C241AF710B6E886C22398537AA9332D5626D022";

        const ibHash_ts = (await hashToHexCopy(ibGib_s7a.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s7a`).isGonnaBe(expected_ib_hash_s7a);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s7a.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s7a`).isGonnaBe(expected_data_hash_s7a);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s7a (from py test logic)`).isGonnaBe(expected_gib_s7a);

        const calculatedGib_ts = (await sha256v1(ibGib_s7a, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s7a (from sha256v1 call)`).isGonnaBe(expected_gib_s7a);
    });

    await ifWe(sir, `Edge Case 7b: data is a primitive type (number)`, async () => {
        const ibGib_s7b: IbGib_V1 = { ib: 's7b', data: 123.45 };

        const expected_ib_hash_s7b = "70348C184BB7E09344EEEE0BA0A766D1DB6C1B1E02520A6534C94F78591EBA46";
        const expected_data_hash_s7b = "4EBC4A141B378980461430980948A55988FBF56F85D084AC33D8A8F61B9FAB88";
        const expected_gib_s7b = "F81D2861750A638FBE6F792D66A8EE2408C5F5CB965755166957C46B1B242F41";

        const ibHash_ts = (await hashToHexCopy(ibGib_s7b.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s7b`).isGonnaBe(expected_ib_hash_s7b);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s7b.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s7b`).isGonnaBe(expected_data_hash_s7b);

        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s7b (from py test logic)`).isGonnaBe(expected_gib_s7b);

        const calculatedGib_ts = (await sha256v1(ibGib_s7b, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s7b (from sha256v1 call)`).isGonnaBe(expected_gib_s7b);
    });

    await ifWe(sir, `Edge Case 8: rel8ns with some relations being empty lists, others non-empty`, async () => {
        const ibGib_s8: IbGib_V1 = {
            ib: 's8',
            rel8ns: { past: [], future: ['addr1'], empty_too: [] }
        };

        const expected_ib_hash_s8 = "1CB7637B6957AC5D6F6CDEC745554AFD3CD1537BB6E7A8E74D41C2EA58B89E97";
        const expected_rel8ns_hash_s8 = "A98E517BB1289561B164706289F2CCE1423EA9ABCA11FC35BFFD4E0817224760";
        const expected_gib_s8 = "EE653CEE56759A6C868A485582E4E66C8B57DFBE1C55CF36BDBF237BF5C09CF8";

        const ibHash_ts = (await hashToHexCopy(ibGib_s8.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s8`).isGonnaBe(expected_ib_hash_s8);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s8.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s8`).isGonnaBe(expected_rel8ns_hash_s8);
        
        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s8 (from py test logic)`).isGonnaBe(expected_gib_s8);

        const calculatedGib_ts = (await sha256v1(ibGib_s8, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s8 (from sha256v1 call)`).isGonnaBe(expected_gib_s8);
    });

    await ifWe(sir, `Edge Case 9: Deeply nested data with mixed undefined/null, lists, and dicts`, async () => {
        const ibGib_s9: IbGib_V1 = {
            ib: 's9',
            data: { level1: { l2_val: 'v2', l2_none: undefined, l2_list: [1, { l3_none: null, l3_val: 'v3' }, 3] } }
        };

        const expected_ib_hash_s9 = "E72D310DBB213F4C2E34DA28935B38905332EE3628A04DF2DD13859FD769C6C5";
        const expected_data_hash_s9 = "F8C3EF9BFBB9D927B55B3BA1FAAECAD1B35FA9B912AEAF9B75A807DA814CB975";
        const expected_gib_s9 = "DB2F3306E2E91F22B0C7B10787760D0FE25BA79B7E3DFFE38164381EA06BE6A6";

        const ibHash_ts = (await hashToHexCopy(ibGib_s9.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s9`).isGonnaBe(expected_ib_hash_s9);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s9.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s9`).isGonnaBe(expected_data_hash_s9);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s9 (from py test logic)`).isGonnaBe(expected_gib_s9);

        const calculatedGib_ts = (await sha256v1(ibGib_s9, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s9 (from sha256v1 call)`).isGonnaBe(expected_gib_s9);
    });

    await ifWe(sir, `Edge Case 10a: ibgib with data but no rel8ns key`, async () => {
        const ibGib_s10a: IbGib_V1 = { ib: 's10a', data: { k: 'v' } };

        const expected_ib_hash_s10a = "7674836E2F8926A8F0BE7998ABB44BACBC041BC51AF761F85E09A1349C60046C";
        const expected_data_hash_s10a = "666C1AA02E8068C6D5CC1D3295009432C16790BEC28EC8CE119D0D1A18D61319";
        const expected_gib_s10a = "81C655EDEC7294CC0900430ED8EE0125EFF15C2F86EAF047C0E8FEFE0D4569E8";

        const ibHash_ts = (await hashToHexCopy(ibGib_s10a.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s10a`).isGonnaBe(expected_ib_hash_s10a);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s10a.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s10a`).isGonnaBe(expected_data_hash_s10a);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + "" + data_hash)
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s10a (from py test logic)`).isGonnaBe(expected_gib_s10a);

        const calculatedGib_ts = (await sha256v1(ibGib_s10a, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s10a (from sha256v1 call)`).isGonnaBe(expected_gib_s10a);
    });

    await ifWe(sir, `Edge Case 10b: ibgib with rel8ns but no data key`, async () => {
        const ibGib_s10b: IbGib_V1 = { ib: 's10b', rel8ns: { r: ['a'] } };

        const expected_ib_hash_s10b = "BF2FDA41B9B401E5F86577387D6C97FCA6AB3F7A4222735C42390B587AC8517D";
        const expected_rel8ns_hash_s10b = "8A47C0659C530ACE4A79B55DE042782ABDFCC89848CDDB71260132B1FFE554AF";
        const expected_gib_s10b = "F35416C53D3683B60C2EE46DD1542A2A1D957F70D991D8DDEDC8C03715ED0DEA";

        const ibHash_ts = (await hashToHexCopy(ibGib_s10b.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s10b`).isGonnaBe(expected_ib_hash_s10b);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s10b.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s10b`).isGonnaBe(expected_rel8ns_hash_s10b);

        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + rel8ns_hash + "")
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s10b (from py test logic)`).isGonnaBe(expected_gib_s10b);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s10b, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s10b (from sha256v1 call)`).isGonnaBe(expected_gib_s10b);
    });

});

await respecfully(sir, `Python Edge Case Tests for sha256v1`, async () => {

    const EMPTY_HASH_FOR_ABSENT_FIELD = "";

    await ifWe(sir, `Edge Case 1: data with mixed undefined and empty string values`, async () => {
        const ibGib_s1: IbGib_V1 = {
            ib: 's1',
            data: { a: undefined, b: '', c: 'val', d: { d1: undefined, d2: 'd2val' } }
        };

        const expected_ib_hash_s1 = "E8BC163C82EEE18733288C7D4AC636DB3A6DEB013EF2D37B68322BE20EDC45CC";
        const expected_data_hash_s1 = "3310C5015C3426C4EC62CF5F5F3EC5D83F86C26E54C5AC3BD05C1B574B46ADE2";
        const expected_gib_s1 = "9B9D08F270C5249FD1DC2E0453010EBD544C7781FF5CDAFADD7679C2C7DA7247";

        const ibHash_ts = (await hashToHexCopy(ibGib_s1.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s1`).isGonnaBe(expected_ib_hash_s1);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s1.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s1`).isGonnaBe(expected_data_hash_s1);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + "" + data_hash)
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s1 (from py test logic)`).isGonnaBe(expected_gib_s1);

        const calculatedGib_ts = (await sha256v1(ibGib_s1, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s1 (from sha256v1 call)`).isGonnaBe(expected_gib_s1);
    });

    await ifWe(sir, `Edge Case 2: rel8ns with a relation mapping to a list containing null`, async () => {
        const ibGib_s2: IbGib_V1 = {
            ib: 's2',
            rel8ns: { next: ['addr1', null, 'addr2'], prev: undefined }
        };

        const expected_ib_hash_s2 = "AD328846AA18B32A335816374511CAC1063C704B8C57999E51DA9F908290A7A4";
        const expected_rel8ns_hash_s2 = "32945B4CE582D29827CA925DCA3155CA397C132F0DB1DB5DFF9AD46A8EFD98FE";
        const expected_gib_s2 = "8DD27B4AFBE3AD7D59768CB4D1A574DC2FEA19546E922101FED6F6ECA9B97C61";

        const ibHash_ts = (await hashToHexCopy(ibGib_s2.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s2`).isGonnaBe(expected_ib_hash_s2);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s2.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s2`).isGonnaBe(expected_rel8ns_hash_s2);

        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + rel8ns_hash + "")
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s2 (from py test logic)`).isGonnaBe(expected_gib_s2);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s2, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s2 (from sha256v1 call)`).isGonnaBe(expected_gib_s2);
    });

    await ifWe(sir, `Edge Case 3: data is an empty list []`, async () => {
        const ibGib_s3: IbGib_V1 = { ib: 's3', data: [] };

        const expected_ib_hash_s3 = "41242B9FAE56FAD4E6E77DFE33CB18D1C3FC583F988CF25EF9F2D9BE0D440BBB";
        const expected_data_hash_s3 = "4F53CDA18C2BAA0C0354BB5F9A3ECBE5ED12AB4D8E11BA873C2F11161202B945";
        const expected_gib_s3 = "BA109F5B0C09CF0A27EF976F876EE8F336DC954EF6443F324F19D78020E3E59A";

        const ibHash_ts = (await hashToHexCopy(ibGib_s3.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s3`).isGonnaBe(expected_ib_hash_s3);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s3.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s3`).isGonnaBe(expected_data_hash_s3);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s3 (from py test logic)`).isGonnaBe(expected_gib_s3);

        const calculatedGib_ts = (await sha256v1(ibGib_s3, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s3 (from sha256v1 call)`).isGonnaBe(expected_gib_s3);
    });

    await ifWe(sir, `Edge Case 4: data contains a list with dictionaries, where inner dicts have null values`, async () => {
        const ibGib_s4: IbGib_V1 = {
            ib: 's4',
            data: { items: [{ id: 1, val: null, name: 'item1' }, { id: 2, val: 'present' }] }
        };

        const expected_ib_hash_s4 = "5B840157E7E86AEF3B3FD0FC24F3ADD34D3E7F210370D429475ED1BCD3E7FCA2";
        const expected_data_hash_s4 = "2682A15F60291F933B57EE14F0A3D5FD233FC90B3FF1ADD5FD473F859FA6B287";
        const expected_gib_s4 = "2AE26C6F9A4D53CE32A0A1792E59F34126A25503CE33728EA7CB8A38E29DD0BF";

        const ibHash_ts = (await hashToHexCopy(ibGib_s4.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s4`).isGonnaBe(expected_ib_hash_s4);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s4.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s4`).isGonnaBe(expected_data_hash_s4);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s4 (from py test logic)`).isGonnaBe(expected_gib_s4);

        const calculatedGib_ts = (await sha256v1(ibGib_s4, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s4 (from sha256v1 call)`).isGonnaBe(expected_gib_s4);
    });

    await ifWe(sir, `Edge Case 5: data key order vs. rel8ns key order`, async () => {
        const ibGib_s5: IbGib_V1 = {
            ib: 's5',
            data: { z: 1, a: 2 },
            rel8ns: { z_rel: ['z1'], a_rel: ['a1'] }
        };

        const expected_ib_hash_s5 = "3B96FC064FA874A80A132BDA60BEBF54EFBC780A358FDCAE4FBBD7E12B66B630";
        const expected_data_hash_s5 = "C2985C5BA6F7D2A55E768F92490CA09388E95BC4CCCB9FDF11B15F4D42F93E73";
        const expected_rel8ns_hash_s5 = "3C0705B51593C740738A0BFB4D9030C8A8093D8A6049346E823CD033BAAA09E5";
        const expected_gib_s5 = "7AC6FB16BC853C6AE7D375ECEEA810ABB6F60241A1679ADEE4DC6ED4E29BE74A";

        const ibHash_ts = (await hashToHexCopy(ibGib_s5.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s5`).isGonnaBe(expected_ib_hash_s5);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s5.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s5`).isGonnaBe(expected_data_hash_s5);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s5.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s5`).isGonnaBe(expected_rel8ns_hash_s5);
        
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s5 (from py test logic)`).isGonnaBe(expected_gib_s5);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s5, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s5 (from sha256v1 call)`).isGonnaBe(expected_gib_s5);
    });

    await ifWe(sir, `Edge Case 6: data with special characters in string values and keys`, async () => {
        const ibGib_s6: IbGib_V1 = {
            ib: 's6',
            data: { 'key "1"': 'value with "quotes" and \n newline', 'key_ñ': 'val_ü' }
        };

        const expected_ib_hash_s6 = "71E7690959239CA065841EBA3EBB281072BAA78BA0BB31079B9ACB4A009A9FE3";
        const expected_data_hash_s6 = "441200D475E6171CD94518A7AD358C29281DBD962163EE7F1B309058098CECE7";
        const expected_gib_s6 = "9AF9BE9284CFCE565CBFD482EA0797E0D67CCD0AEDF6509BCEA3B9D4D00931BF";

        const ibHash_ts = (await hashToHexCopy(ibGib_s6.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s6`).isGonnaBe(expected_ib_hash_s6);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s6.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s6`).isGonnaBe(expected_data_hash_s6);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s6 (from py test logic)`).isGonnaBe(expected_gib_s6);

        const calculatedGib_ts = (await sha256v1(ibGib_s6, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s6 (from sha256v1 call)`).isGonnaBe(expected_gib_s6);
    });

    await ifWe(sir, `Edge Case 7a: data is a primitive type (boolean True)`, async () => {
        const ibGib_s7a: IbGib_V1 = { ib: 's7a', data: true };

        const expected_ib_hash_s7a = "612A9EB864ED62C258BDCB155F13F590879BA34AD30DDE91CB9BE38139439E9F";
        const expected_data_hash_s7a = "B5BEA41B6C623F7C09F1BF24DCAE58EBAB3C0CDD90AD966BC43A45B44867E12B";
        const expected_gib_s7a = "53BBABB9F24C75E3C6037D744C241AF710B6E886C22398537AA9332D5626D022";

        const ibHash_ts = (await hashToHexCopy(ibGib_s7a.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s7a`).isGonnaBe(expected_ib_hash_s7a);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s7a.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s7a`).isGonnaBe(expected_data_hash_s7a);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s7a (from py test logic)`).isGonnaBe(expected_gib_s7a);

        const calculatedGib_ts = (await sha256v1(ibGib_s7a, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s7a (from sha256v1 call)`).isGonnaBe(expected_gib_s7a);
    });

    await ifWe(sir, `Edge Case 7b: data is a primitive type (number)`, async () => {
        const ibGib_s7b: IbGib_V1 = { ib: 's7b', data: 123.45 };

        const expected_ib_hash_s7b = "70348C184BB7E09344EEEE0BA0A766D1DB6C1B1E02520A6534C94F78591EBA46";
        const expected_data_hash_s7b = "4EBC4A141B378980461430980948A55988FBF56F85D084AC33D8A8F61B9FAB88";
        const expected_gib_s7b = "F81D2861750A638FBE6F792D66A8EE2408C5F5CB965755166957C46B1B242F41";

        const ibHash_ts = (await hashToHexCopy(ibGib_s7b.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s7b`).isGonnaBe(expected_ib_hash_s7b);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s7b.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s7b`).isGonnaBe(expected_data_hash_s7b);

        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s7b (from py test logic)`).isGonnaBe(expected_gib_s7b);

        const calculatedGib_ts = (await sha256v1(ibGib_s7b, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s7b (from sha256v1 call)`).isGonnaBe(expected_gib_s7b);
    });

    await ifWe(sir, `Edge Case 8: rel8ns with some relations being empty lists, others non-empty`, async () => {
        const ibGib_s8: IbGib_V1 = {
            ib: 's8',
            rel8ns: { past: [], future: ['addr1'], empty_too: [] }
        };

        const expected_ib_hash_s8 = "1CB7637B6957AC5D6F6CDEC745554AFD3CD1537BB6E7A8E74D41C2EA58B89E97";
        const expected_rel8ns_hash_s8 = "A98E517BB1289561B164706289F2CCE1423EA9ABCA11FC35BFFD4E0817224760";
        const expected_gib_s8 = "EE653CEE56759A6C868A485582E4E66C8B57DFBE1C55CF36BDBF237BF5C09CF8";

        const ibHash_ts = (await hashToHexCopy(ibGib_s8.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s8`).isGonnaBe(expected_ib_hash_s8);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s8.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s8`).isGonnaBe(expected_rel8ns_hash_s8);
        
        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s8 (from py test logic)`).isGonnaBe(expected_gib_s8);

        const calculatedGib_ts = (await sha256v1(ibGib_s8, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s8 (from sha256v1 call)`).isGonnaBe(expected_gib_s8);
    });

    await ifWe(sir, `Edge Case 9: Deeply nested data with mixed undefined/null, lists, and dicts`, async () => {
        const ibGib_s9: IbGib_V1 = {
            ib: 's9',
            data: { level1: { l2_val: 'v2', l2_none: undefined, l2_list: [1, { l3_none: null, l3_val: 'v3' }, 3] } }
        };

        const expected_ib_hash_s9 = "E72D310DBB213F4C2E34DA28935B38905332EE3628A04DF2DD13859FD769C6C5";
        const expected_data_hash_s9 = "F8C3EF9BFBB9D927B55B3BA1FAAECAD1B35FA9B912AEAF9B75A807DA814CB975";
        const expected_gib_s9 = "DB2F3306E2E91F22B0C7B10787760D0FE25BA79B7E3DFFE38164381EA06BE6A6";

        const ibHash_ts = (await hashToHexCopy(ibGib_s9.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s9`).isGonnaBe(expected_ib_hash_s9);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s9.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s9`).isGonnaBe(expected_data_hash_s9);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s9 (from py test logic)`).isGonnaBe(expected_gib_s9);

        const calculatedGib_ts = (await sha256v1(ibGib_s9, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s9 (from sha256v1 call)`).isGonnaBe(expected_gib_s9);
    });

    await ifWe(sir, `Edge Case 10a: ibgib with data but no rel8ns key`, async () => {
        const ibGib_s10a: IbGib_V1 = { ib: 's10a', data: { k: 'v' } };

        const expected_ib_hash_s10a = "7674836E2F8926A8F0BE7998ABB44BACBC041BC51AF761F85E09A1349C60046C";
        const expected_data_hash_s10a = "666C1AA02E8068C6D5CC1D3295009432C16790BEC28EC8CE119D0D1A18D61319";
        const expected_gib_s10a = "81C655EDEC7294CC0900430ED8EE0125EFF15C2F86EAF047C0E8FEFE0D4569E8";

        const ibHash_ts = (await hashToHexCopy(ibGib_s10a.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s10a`).isGonnaBe(expected_ib_hash_s10a);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s10a.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s10a`).isGonnaBe(expected_data_hash_s10a);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + "" + data_hash)
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s10a (from py test logic)`).isGonnaBe(expected_gib_s10a);

        const calculatedGib_ts = (await sha256v1(ibGib_s10a, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s10a (from sha256v1 call)`).isGonnaBe(expected_gib_s10a);
    });

    await ifWe(sir, `Edge Case 10b: ibgib with rel8ns but no data key`, async () => {
        const ibGib_s10b: IbGib_V1 = { ib: 's10b', rel8ns: { r: ['a'] } };

        const expected_ib_hash_s10b = "BF2FDA41B9B401E5F86577387D6C97FCA6AB3F7A4222735C42390B587AC8517D";
        const expected_rel8ns_hash_s10b = "8A47C0659C530ACE4A79B55DE042782ABDFCC89848CDDB71260132B1FFE554AF";
        const expected_gib_s10b = "F35416C53D3683B60C2EE46DD1542A2A1D957F70D991D8DDEDC8C03715ED0DEA";

        const ibHash_ts = (await hashToHexCopy(ibGib_s10b.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s10b`).isGonnaBe(expected_ib_hash_s10b);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s10b.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s10b`).isGonnaBe(expected_rel8ns_hash_s10b);

        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + rel8ns_hash + "")
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s10b (from py test logic)`).isGonnaBe(expected_gib_s10b);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s10b, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s10b (from sha256v1 call)`).isGonnaBe(expected_gib_s10b);
    });

});


await respecfully(sir, `Python Edge Case Tests for sha256v1`, async () => {

    const EMPTY_HASH_FOR_ABSENT_FIELD = ""; // Equivalent to Python's "" for non-existent data/rel8ns hashes

    await ifWe(sir, `Edge Case 1: data with mixed undefined and empty string values`, async () => {
        const ibGib_s1: IbGib_V1 = {
            ib: 's1',
            data: { a: undefined, b: '', c: 'val', d: { d1: undefined, d2: 'd2val' } }
        };

        const expected_ib_hash_s1 = "E8BC163C82EEE18733288C7D4AC636DB3A6DEB013EF2D37B68322BE20EDC45CC";
        const expected_data_hash_s1 = "3310C5015C3426C4EC62CF5F5F3EC5D83F86C26E54C5AC3BD05C1B574B46ADE2";
        const expected_gib_s1 = "9B9D08F270C5249FD1DC2E0453010EBD544C7781FF5CDAFADD7679C2C7DA7247";

        const ibHash_ts = (await hashToHexCopy(ibGib_s1.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s1`).isGonnaBe(expected_ib_hash_s1);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s1.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s1`).isGonnaBe(expected_data_hash_s1);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + "" + data_hash)
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s1 (from py test logic)`).isGonnaBe(expected_gib_s1);

        const calculatedGib_ts = (await sha256v1(ibGib_s1, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s1 (from sha256v1 call)`).isGonnaBe(expected_gib_s1);
    });

    await ifWe(sir, `Edge Case 2: rel8ns with a relation mapping to a list containing null`, async () => {
        const ibGib_s2: IbGib_V1 = {
            ib: 's2',
            rel8ns: { next: ['addr1', null, 'addr2'], prev: undefined }
        };

        const expected_ib_hash_s2 = "AD328846AA18B32A335816374511CAC1063C704B8C57999E51DA9F908290A7A4";
        const expected_rel8ns_hash_s2 = "32945B4CE582D29827CA925DCA3155CA397C132F0DB1DB5DFF9AD46A8EFD98FE";
        const expected_gib_s2 = "8DD27B4AFBE3AD7D59768CB4D1A574DC2FEA19546E922101FED6F6ECA9B97C61";

        const ibHash_ts = (await hashToHexCopy(ibGib_s2.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s2`).isGonnaBe(expected_ib_hash_s2);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s2.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s2`).isGonnaBe(expected_rel8ns_hash_s2);

        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + rel8ns_hash + "")
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s2 (from py test logic)`).isGonnaBe(expected_gib_s2);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s2, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s2 (from sha256v1 call)`).isGonnaBe(expected_gib_s2);
    });

    await ifWe(sir, `Edge Case 3: data is an empty list []`, async () => {
        const ibGib_s3: IbGib_V1 = { ib: 's3', data: [] };

        const expected_ib_hash_s3 = "41242B9FAE56FAD4E6E77DFE33CB18D1C3FC583F988CF25EF9F2D9BE0D440BBB";
        const expected_data_hash_s3 = "4F53CDA18C2BAA0C0354BB5F9A3ECBE5ED12AB4D8E11BA873C2F11161202B945";
        const expected_gib_s3 = "BA109F5B0C09CF0A27EF976F876EE8F336DC954EF6443F324F19D78020E3E59A";

        const ibHash_ts = (await hashToHexCopy(ibGib_s3.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s3`).isGonnaBe(expected_ib_hash_s3);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s3.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s3`).isGonnaBe(expected_data_hash_s3);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s3 (from py test logic)`).isGonnaBe(expected_gib_s3);

        const calculatedGib_ts = (await sha256v1(ibGib_s3, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s3 (from sha256v1 call)`).isGonnaBe(expected_gib_s3);
    });

    await ifWe(sir, `Edge Case 4: data contains a list with dictionaries, where inner dicts have null values`, async () => {
        const ibGib_s4: IbGib_V1 = {
            ib: 's4',
            data: { items: [{ id: 1, val: null, name: 'item1' }, { id: 2, val: 'present' }] }
        };

        const expected_ib_hash_s4 = "5B840157E7E86AEF3B3FD0FC24F3ADD34D3E7F210370D429475ED1BCD3E7FCA2";
        const expected_data_hash_s4 = "2682A15F60291F933B57EE14F0A3D5FD233FC90B3FF1ADD5FD473F859FA6B287";
        const expected_gib_s4 = "2AE26C6F9A4D53CE32A0A1792E59F34126A25503CE33728EA7CB8A38E29DD0BF";

        const ibHash_ts = (await hashToHexCopy(ibGib_s4.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s4`).isGonnaBe(expected_ib_hash_s4);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s4.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s4`).isGonnaBe(expected_data_hash_s4);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s4 (from py test logic)`).isGonnaBe(expected_gib_s4);

        const calculatedGib_ts = (await sha256v1(ibGib_s4, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s4 (from sha256v1 call)`).isGonnaBe(expected_gib_s4);
    });

    await ifWe(sir, `Edge Case 5: data key order vs. rel8ns key order`, async () => {
        const ibGib_s5: IbGib_V1 = {
            ib: 's5',
            data: { z: 1, a: 2 },
            rel8ns: { z_rel: ['z1'], a_rel: ['a1'] }
        };

        const expected_ib_hash_s5 = "3B96FC064FA874A80A132BDA60BEBF54EFBC780A358FDCAE4FBBD7E12B66B630";
        const expected_data_hash_s5 = "C2985C5BA6F7D2A55E768F92490CA09388E95BC4CCCB9FDF11B15F4D42F93E73";
        const expected_rel8ns_hash_s5 = "3C0705B51593C740738A0BFB4D9030C8A8093D8A6049346E823CD033BAAA09E5";
        const expected_gib_s5 = "7AC6FB16BC853C6AE7D375ECEEA810ABB6F60241A1679ADEE4DC6ED4E29BE74A";

        const ibHash_ts = (await hashToHexCopy(ibGib_s5.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s5`).isGonnaBe(expected_ib_hash_s5);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s5.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s5`).isGonnaBe(expected_data_hash_s5);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s5.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s5`).isGonnaBe(expected_rel8ns_hash_s5);
        
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s5 (from py test logic)`).isGonnaBe(expected_gib_s5);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s5, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s5 (from sha256v1 call)`).isGonnaBe(expected_gib_s5);
    });

    await ifWe(sir, `Edge Case 6: data with special characters in string values and keys`, async () => {
        const ibGib_s6: IbGib_V1 = {
            ib: 's6',
            data: { 'key "1"': 'value with "quotes" and \n newline', 'key_ñ': 'val_ü' }
        };

        const expected_ib_hash_s6 = "71E7690959239CA065841EBA3EBB281072BAA78BA0BB31079B9ACB4A009A9FE3";
        const expected_data_hash_s6 = "441200D475E6171CD94518A7AD358C29281DBD962163EE7F1B309058098CECE7";
        const expected_gib_s6 = "9AF9BE9284CFCE565CBFD482EA0797E0D67CCD0AEDF6509BCEA3B9D4D00931BF";

        const ibHash_ts = (await hashToHexCopy(ibGib_s6.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s6`).isGonnaBe(expected_ib_hash_s6);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s6.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s6`).isGonnaBe(expected_data_hash_s6);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s6 (from py test logic)`).isGonnaBe(expected_gib_s6);

        const calculatedGib_ts = (await sha256v1(ibGib_s6, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s6 (from sha256v1 call)`).isGonnaBe(expected_gib_s6);
    });

    await ifWe(sir, `Edge Case 7a: data is a primitive type (boolean True)`, async () => {
        const ibGib_s7a: IbGib_V1 = { ib: 's7a', data: true };

        const expected_ib_hash_s7a = "612A9EB864ED62C258BDCB155F13F590879BA34AD30DDE91CB9BE38139439E9F";
        const expected_data_hash_s7a = "B5BEA41B6C623F7C09F1BF24DCAE58EBAB3C0CDD90AD966BC43A45B44867E12B";
        const expected_gib_s7a = "53BBABB9F24C75E3C6037D744C241AF710B6E886C22398537AA9332D5626D022";

        const ibHash_ts = (await hashToHexCopy(ibGib_s7a.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s7a`).isGonnaBe(expected_ib_hash_s7a);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s7a.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s7a`).isGonnaBe(expected_data_hash_s7a);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s7a (from py test logic)`).isGonnaBe(expected_gib_s7a);

        const calculatedGib_ts = (await sha256v1(ibGib_s7a, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s7a (from sha256v1 call)`).isGonnaBe(expected_gib_s7a);
    });

    await ifWe(sir, `Edge Case 7b: data is a primitive type (number)`, async () => {
        const ibGib_s7b: IbGib_V1 = { ib: 's7b', data: 123.45 };

        const expected_ib_hash_s7b = "70348C184BB7E09344EEEE0BA0A766D1DB6C1B1E02520A6534C94F78591EBA46";
        const expected_data_hash_s7b = "4EBC4A141B378980461430980948A55988FBF56F85D084AC33D8A8F61B9FAB88";
        const expected_gib_s7b = "F81D2861750A638FBE6F792D66A8EE2408C5F5CB965755166957C46B1B242F41";

        const ibHash_ts = (await hashToHexCopy(ibGib_s7b.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s7b`).isGonnaBe(expected_ib_hash_s7b);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s7b.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s7b`).isGonnaBe(expected_data_hash_s7b);

        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s7b (from py test logic)`).isGonnaBe(expected_gib_s7b);

        const calculatedGib_ts = (await sha256v1(ibGib_s7b, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s7b (from sha256v1 call)`).isGonnaBe(expected_gib_s7b);
    });

    await ifWe(sir, `Edge Case 8: rel8ns with some relations being empty lists, others non-empty`, async () => {
        const ibGib_s8: IbGib_V1 = {
            ib: 's8',
            rel8ns: { past: [], future: ['addr1'], empty_too: [] }
        };

        const expected_ib_hash_s8 = "1CB7637B6957AC5D6F6CDEC745554AFD3CD1537BB6E7A8E74D41C2EA58B89E97";
        const expected_rel8ns_hash_s8 = "A98E517BB1289561B164706289F2CCE1423EA9ABCA11FC35BFFD4E0817224760";
        const expected_gib_s8 = "EE653CEE56759A6C868A485582E4E66C8B57DFBE1C55CF36BDBF237BF5C09CF8";

        const ibHash_ts = (await hashToHexCopy(ibGib_s8.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s8`).isGonnaBe(expected_ib_hash_s8);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s8.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s8`).isGonnaBe(expected_rel8ns_hash_s8);
        
        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s8 (from py test logic)`).isGonnaBe(expected_gib_s8);

        const calculatedGib_ts = (await sha256v1(ibGib_s8, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s8 (from sha256v1 call)`).isGonnaBe(expected_gib_s8);
    });

    await ifWe(sir, `Edge Case 9: Deeply nested data with mixed undefined/null, lists, and dicts`, async () => {
        const ibGib_s9: IbGib_V1 = {
            ib: 's9',
            data: { level1: { l2_val: 'v2', l2_none: undefined, l2_list: [1, { l3_none: null, l3_val: 'v3' }, 3] } }
        };

        const expected_ib_hash_s9 = "E72D310DBB213F4C2E34DA28935B38905332EE3628A04DF2DD13859FD769C6C5";
        const expected_data_hash_s9 = "F8C3EF9BFBB9D927B55B3BA1FAAECAD1B35FA9B912AEAF9B75A807DA814CB975";
        const expected_gib_s9 = "DB2F3306E2E91F22B0C7B10787760D0FE25BA79B7E3DFFE38164381EA06BE6A6";

        const ibHash_ts = (await hashToHexCopy(ibGib_s9.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s9`).isGonnaBe(expected_ib_hash_s9);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s9.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s9`).isGonnaBe(expected_data_hash_s9);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s9 (from py test logic)`).isGonnaBe(expected_gib_s9);

        const calculatedGib_ts = (await sha256v1(ibGib_s9, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s9 (from sha256v1 call)`).isGonnaBe(expected_gib_s9);
    });

    await ifWe(sir, `Edge Case 10a: ibgib with data but no rel8ns key`, async () => {
        const ibGib_s10a: IbGib_V1 = { ib: 's10a', data: { k: 'v' } };

        const expected_ib_hash_s10a = "7674836E2F8926A8F0BE7998ABB44BACBC041BC51AF761F85E09A1349C60046C";
        const expected_data_hash_s10a = "666C1AA02E8068C6D5CC1D3295009432C16790BEC28EC8CE119D0D1A18D61319";
        const expected_gib_s10a = "81C655EDEC7294CC0900430ED8EE0125EFF15C2F86EAF047C0E8FEFE0D4569E8";

        const ibHash_ts = (await hashToHexCopy(ibGib_s10a.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s10a`).isGonnaBe(expected_ib_hash_s10a);

        const normalizedData_ts = toNormalizedForHashing(ibGib_s10a.data);
        const stringifiedData_ts = JSON.stringify(normalizedData_ts, getJsonReplacer_SortKeys());
        const actualDataHash_ts = (await hashToHexCopy(stringifiedData_ts))?.toUpperCase() || '';
        iReckon(sir, actualDataHash_ts, `actualDataHash_ts for s10a`).isGonnaBe(expected_data_hash_s10a);
        
        const actualRel8nsHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + "" + data_hash)
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s10a (from py test logic)`).isGonnaBe(expected_gib_s10a);

        const calculatedGib_ts = (await sha256v1(ibGib_s10a, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s10a (from sha256v1 call)`).isGonnaBe(expected_gib_s10a);
    });

    await ifWe(sir, `Edge Case 10b: ibgib with rel8ns but no data key`, async () => {
        const ibGib_s10b: IbGib_V1 = { ib: 's10b', rel8ns: { r: ['a'] } };

        const expected_ib_hash_s10b = "BF2FDA41B9B401E5F86577387D6C97FCA6AB3F7A4222735C42390B587AC8517D";
        const expected_rel8ns_hash_s10b = "8A47C0659C530ACE4A79B55DE042782ABDFCC89848CDDB71260132B1FFE554AF";
        const expected_gib_s10b = "F35416C53D3683B60C2EE46DD1542A2A1D957F70D991D8DDEDC8C03715ED0DEA";

        const ibHash_ts = (await hashToHexCopy(ibGib_s10b.ib!))?.toUpperCase() || '';
        iReckon(sir, ibHash_ts, `ibHash_ts for s10b`).isGonnaBe(expected_ib_hash_s10b);

        const normalizedRel8ns_ts = toNormalizedForHashing(ibGib_s10b.rel8ns);
        const stringifiedRel8ns_ts = JSON.stringify(normalizedRel8ns_ts, getJsonReplacer_SortKeys());
        const actualRel8nsHash_ts = (await hashToHexCopy(stringifiedRel8ns_ts))?.toUpperCase() || '';
        iReckon(sir, actualRel8nsHash_ts, `actualRel8nsHash_ts for s10b`).isGonnaBe(expected_rel8ns_hash_s10b);

        const actualDataHash_ts = EMPTY_HASH_FOR_ABSENT_FIELD;
        // Manual final gib construction based on Python test logic: hash(ib_hash + rel8ns_hash + "")
        const combinedSource_manual_ts = ibHash_ts + actualRel8nsHash_ts + actualDataHash_ts;
        const manualGib_ts = (await hashToHexCopy(combinedSource_manual_ts))?.toUpperCase() || '';
        iReckon(sir, manualGib_ts, `manualGib_ts for s10b (from py test logic)`).isGonnaBe(expected_gib_s10b);
        
        const calculatedGib_ts = (await sha256v1(ibGib_s10b, ""))?.toUpperCase();
        iReckon(sir, calculatedGib_ts, `calculatedGib_ts for s10b (from sha256v1 call)`).isGonnaBe(expected_gib_s10b);
    });

});
