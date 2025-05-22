import {
    getTimestamp, getSaferSubstring, getTimestampInTicks, pickRandom,
    pickRandom_Letters, replaceCharAt, hash, HashAlgorithm, getUUID, clone, extractErrorMsg,
    mergeMapsOrArrays_Naive,
} from "./utils-helper.mjs";

import { respecfully, iReckon, ifWe, ifWeMight, respecfullyDear, } from '../respec-gib/respec-gib.mjs';
import { ONLY_HAS_NON_ALPHANUMERICS } from "../constants.mjs";
let maam = `[${import.meta.url}]`, sir = maam;

// #region test data

const SOME_STRING = "This is some stringy stuff...";
const SOME_STRING_HASH = "5DC14EA1027B956AD6BA51F11372DF823FCF3429B5F2063F1DDA358E0F4F2992";
const SOME_STRING_HASH_512 = "C48C780DA7C43EE7047CDAB0D7A2FDF5DC050DF3291D3CAE973FB0F51BE8535668592EB25A730C95A23D3B4D57924893E7E87C86DC0F52C6D5D2E34EE41203E5";
const SOME_OTHER_STRING = "This is quite a different string of stuff.";
const TEST_HASHES: { [key: string]: string } = {
    [SOME_STRING + HashAlgorithm.sha_256]: SOME_STRING_HASH,
    [SOME_STRING + HashAlgorithm.sha_512]: SOME_STRING_HASH_512,
    [SOME_OTHER_STRING + HashAlgorithm.sha_256]: 'AE4C18B37B2329770E05EA3F946C6EB6DE56D2DC568E1F5CBB395E2A1556F58A',
    [SOME_OTHER_STRING + HashAlgorithm.sha_512]: '2F1A72B21C914ED459319DF4B5D70E81CEE67C4B48BC74CD6BA8F41DCEC20DCD100C914913F370B2782985268D05C590B46F3FE9005A7477BA952935D2454E53',
}

// #endregion test data

await respecfully(sir, `hash`, async () => {

    await ifWe(sir, `should digest simple string consistently`, async () => {
        let h = await hash({ s: '42' });
        iReckon(sir, h).asTo('42').isGonnaBe('73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049');
        iReckon(sir, undefined).isGonnaBeUndefined();
    });
    await ifWe(sir, `should digest simple stringified ibgib`, async () => {
        let ibgib: any = { ib: 'ib', gib: 'gib' };
        let h = await hash({ s: JSON.stringify(ibgib) });
        iReckon(sir, h).asTo('ib^gib').isGonnaBe('cbad0694a257358c044611ea1fa88ace71a01a9b8409d2354d0387d8043f7671');
    });

});

await respecfully(sir, `clone`, async () => {

    await ifWe(sir, `should copy deep objects`, async () => {
        const objSimple = { a: SOME_STRING };
        const objADeep = {
            levelOne: {
                levelTwo: {
                    buckle: "your shoe",
                    three: "four",
                    objSimple: objSimple,
                }
            }
        };
        const cloneADeep = clone(objADeep);
        iReckon(sir, cloneADeep?.levelOne?.levelTwo?.buckle).isGonnaBe("your shoe");
        iReckon(sir, cloneADeep?.levelOne?.levelTwo?.three).isGonnaBe("four");
        iReckon(sir, cloneADeep?.levelOne?.levelTwo?.objSimple).willEqual(objSimple);

        cloneADeep.levelOne.levelTwo.objSimple.a = SOME_OTHER_STRING;

        // original should **still** be the first value
        iReckon(sir, objSimple.a).isGonnaBe(SOME_STRING);
        // clone should be changed.
        iReckon(sir, cloneADeep.levelOne.levelTwo.objSimple.a).isGonnaBe(SOME_OTHER_STRING);
    });

});

await respecfully(sir, `getTimestamp`, async () => {

    await ifWe(sir, `should get the current date as UTCString`, async () => {
        // implementation detail hmm....
        const timestamp = getTimestamp();
        const date = new Date(timestamp);
        const dateAsUTCString = date.toUTCString();
        iReckon(sir, timestamp).isGonnaBe(dateAsUTCString);
    });

});

await respecfully(sir, `hash`, async () => {
    const TEST_ALGORITHMS: HashAlgorithm[] = Object.values(HashAlgorithm);

    // implicit is just SHA-256
    await ifWe(sir, `should hash consistently with implicit SHA-256`, async () => {
        const hashed = await hash({ s: SOME_STRING }) || "";
        iReckon(sir, hashed.toUpperCase()).isGonnaBe(TEST_HASHES[SOME_STRING + 'SHA-256']);
    });

    for (let algorithm of TEST_ALGORITHMS) {
        await ifWe(sir, `should hash consistently with explicit ${algorithm}`, async () => {
            // const hash = await hash({s: SOME_STRING, algorithm: "SHA-256"}) || "";
            let hashed = await hash({ s: SOME_STRING, algorithm }) || "";
            iReckon(sir, hashed.toUpperCase()).isGonnaBe(TEST_HASHES[SOME_STRING + algorithm]);
            hashed = await hash({ s: SOME_OTHER_STRING, algorithm }) || "";
            iReckon(sir, hashed.toUpperCase()).isGonnaBe(TEST_HASHES[SOME_OTHER_STRING + algorithm]);
        });
        await ifWe(sir, `should hash without collisions, 1000 times, ${algorithm}`, async () => {
            const hashes: string[] = [];
            const salt = await getUUID(1024);
            // console.log(`salt: ${salt}`);
            for (let i = 0; i < 1000; i++) {
                const hashed = await hash({ s: salt + i.toString(), algorithm }) || "";
                // console.log(hash);
                iReckon(sir, hashes).not.includes(hashed);
                hashes.push(hashed);
            }
        });
    };

});

await respecfully(sir, `generating UUIDs`, async () => {

    await ifWe(sir, `shouldn't duplicate UUIDs`, async () => {
        const ids: string[] = [];
        for (let i = 0; i < 100; i++) {
            const id = await getUUID();
            iReckon(sir, ids).not.includes(id);
            ids.push(id);
        }
    });

});

await respecfully(sir, `extractErrorMsg`, async () => {

    await ifWe(sir, `should return canned msg when error is falsy`, () => {
        const defaultMsg = '[error is falsy]'; // duplicate of code in helper.mjs
        [null, undefined, ''].forEach(error => {
            iReckon(sir, extractErrorMsg(error)).asTo(JSON.stringify(error)).willEqual(defaultMsg);
        });
    });
    await ifWe(sir, `should return incoming error if it is a string`, () => {
        ['string here', 'undefined', '42', 'ibgib'].forEach(stringError => {
            iReckon(sir, extractErrorMsg(stringError)).asTo(JSON.stringify(stringError)).willEqual(stringError);
        });
    });
    await ifWe(sir, `should return error.message if it's a thrown error`, () => {
        ['string here', 'undefined', 'something went wrong', 'danger. out of memory (E: ce86ffd7a0174c1d8ce5e56c807dd4b1)']
            .map(x => new Error(x))
            .forEach(error => {
                iReckon(sir, extractErrorMsg(error)).asTo(error.message).willEqual(error.message);
            });
    });
    await ifWe(sir, `should return incoming error stringified if it is a number`, () => {
        [1234, 0, 1_000, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -5, 1 / 23].forEach(numberError => {
            iReckon(sir, extractErrorMsg(numberError)).asTo(JSON.stringify(numberError)).willEqual(JSON.stringify(numberError));
        });
    });
    await ifWe(sir, `should return canned response with type if incoming error is none of the above`, () => {
        let error = { x: 1, y: 2 };
        let msg = extractErrorMsg(error);
        iReckon(sir, msg).asTo(JSON.stringify(error)).isGonnaBeTruthy();
    });
    await ifWe(sir, `should warn (but still succeed) when passing in curly brace {error} instead of bare error`, () => {
        ['string here', 'undefined', 'something went wrong', 'danger. out of memory (E: b05cd3858cd147daaf1fdbe8848d30f0)']
            .map(x => new Error(x))
            .forEach(error => {
                // note the curly braces `{ error }` passed in. this is not
                // required and resolves to an unnecessary recursive call to
                // extractErrorMsg(error.error)
                console.log(`expecting extractErrorMsg warning...`);
                iReckon(sir, extractErrorMsg({ error })).asTo(error.message).willEqual(error.message);
            });
    });

});

await respecfully(sir, 'getTimestampInTicks', async () => {

    await ifWe(sir, 'result in ticks should be an integer string', () => {
        for (let i = 0; i < 1000; i++) {
            const ticks = getTimestampInTicks();
            const x: number = Number.parseInt(ticks);
            iReckon(sir, Number.isInteger(x)).isGonnaBeTrue();
        }
    });

    await ifWe(sir, 'timestamp arg should provide known ticks value', () => {
        const timestamp = "Thu Oct 27 2022 11:54:10 GMT-0500 (Central Daylight Time)";
        const knownTicks = 1666889650000;
        const ticksAsString = getTimestampInTicks(timestamp);
        const ticksAsInt = Number.parseInt(ticksAsString);
        iReckon(sir, ticksAsInt).willEqual(knownTicks);
    });
    await ifWe(sir, 'real use case of timestamp to ticks to timestamp', () => {
        // from timestamp
        const timestamp = getTimestamp(); // UTC String
        const dateFromTimestamp = new Date(timestamp);

        // get ticks from that timestamp
        const ticks = getTimestampInTicks(timestamp);

        // get a completely new date object using the ticks
        const dateFromTicks = new Date();
        dateFromTicks.setTime(Number.parseInt(ticks));

        // both date objects should output the same UTC string
        iReckon(sir, timestamp).willEqual(dateFromTicks.toUTCString());
        iReckon(sir, dateFromTimestamp.toUTCString()).willEqual(dateFromTicks.toUTCString());
    });

});

await respecfully(sir, 'getSaferSubstring', async () => {

    const textsWithQuestionMarks = ['????yo?', '?start', 'end?', 'i?got?questions',];
    const textsWithOnlyNonAlphanumerics = ['(*^*%$%#%^#^%#??//', ':";\' "'];
    const textsWithCharacters = [...textsWithQuestionMarks, ...textsWithOnlyNonAlphanumerics, 'i have spaces', 'i-have-hyphens', 'i/got/slashes', 'got\\back\\slashes'];

    await respecfully(sir, 'with keepliterals empty', async () => {

        await ifWe(sir, 'should remove non alphanumerics', async () => {
            for (let i = 0; i < textsWithCharacters.length; i++) {
                const text = textsWithCharacters[i];
                const saferText = getSaferSubstring({ text, keepLiterals: [] });
                iReckon(sir, saferText.match(/^\w+$/)).isGonnaBeTruthy({ addedMsg: `nope: ${text}` });
            }
        });
    });

    await respecfully(sir, 'with setting length', async () => {

        await ifWe(sir, 'set length less than text should truncate', async () => {
            const longString = "this is a very long string here one two three fojoiwjefoijew ifoewijfoiewjfioewjf oiewjf oiewjf oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjff oiewjf ewoijfew 9ifjew 98fjew 9fjewiuwjf";
            const texts: string[] = [
                longString,
                ...textsWithCharacters,
            ];
            const lengths: number[] = [2, 3, 5, 10, 20, 30];
            for (let i = 0; i < texts.length; i++) {
                for (let j = 0; j < lengths.length; j++) {
                    const length = lengths[j];
                    const text = texts[i];
                    const saferText = getSaferSubstring({
                        text,
                        length,
                        keepLiterals: []
                    });
                    const lengthIsTheSame = saferText.length <= length;
                    const isAlpha = saferText === ONLY_HAS_NON_ALPHANUMERICS;
                    iReckon(sir, lengthIsTheSame || isAlpha).isGonnaBeTrue({
                        addedMsg: `saferText (${saferText}) length: ${saferText.length}, length: ${length}`,
                    });
                }
            }
        });
    });

});

await respecfully(sir, 'pickRandom', async () => {

    await ifWe(sir, 'should pick a random letter from an array of letters', () => {
        const letters = ['a', 'b', 'c', 'd', 'E'];
        const letter = pickRandom({ x: letters })!;
        iReckon(sir, letters.includes(letter)).isGonnaBeTruthy();
    });
    await ifWe(sir, 'should pick a random number from an array of numbers', () => {
        const numbers = [0, 1, 2, 3, 4, 5, 6, 42];
        const n = pickRandom({ x: numbers })!;
        iReckon(sir, numbers.includes(n)).isGonnaBeTruthy();
    });
    await ifWe(sir, 'should ultimately pick each of the items over many iterations (m=10, i=1000)', () => {
        const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 42];
        const numbersPicked: Set<number> = new Set<number>();
        for (let i = 0; i < 1000; i++) {
            const n = pickRandom({ x: numbers })!;
            iReckon(sir, n).not.isGonnaBeUndefined();
            numbersPicked.add(n);
        }
        iReckon(sir, numbersPicked.size).willEqual(numbers.length);
    });

});

await respecfully(sir, 'pickRandom_Letters', async () => {

    await ifWe(sir, 'should pick some random letters the size of count', () => {
        const counts = [1, 4, 15, 30, 100];
        for (let i = 0; i < counts.length; i++) {
            const count = counts[i];
            const letters = pickRandom_Letters({ count })!;
            iReckon(sir, letters).isGonnaBeTruthy();
            iReckon(sir, letters.length).willEqual(count);
            iReckon(sir, letters.match(/^\w+$/)).isGonnaBeTruthy();
        }
    });
    await ifWe(sir, 'should NOT pick the same letters in tight loop (counts=10,15 i=100)', () => {
        const counts = [10, 15];
        const iterations = 100;
        const alreadyPicked: Set<string> = new Set<string>();
        for (let i = 0; i < counts.length; i++) {
            const count = counts[i];
            for (let j = 0; j < iterations; j++) {
                const letters = pickRandom_Letters({ count });
                iReckon(sir, alreadyPicked.has(letters)).isGonnaBeFalse();
                alreadyPicked.add(letters);
            }
        }
    });

});

await respecfully(sir, 'replaceCharAt', async () => {

    await ifWe(sir, 'should replace chars in strings', () => {
        let test = 'this is a string (1) here woohoo!\nAnd this is (2) the second line.';
        let newChar = '_';

        let index1 = test.indexOf('1');
        let manuallyReplaced1 = `this is a string (${newChar}) here woohoo!\nAnd this is (2) the second line.`;
        let result1 = replaceCharAt({ s: test, pos: index1, newChar: '_' });
        iReckon(sir, result1).willEqual(manuallyReplaced1);

        let index2 = test.indexOf('2');
        let manuallyReplaced2 = `this is a string (1) here woohoo!\nAnd this is (${newChar}) the second line.`;
        let result2 = replaceCharAt({ s: test, pos: index2, newChar: '_' });
        iReckon(sir, result2).willEqual(manuallyReplaced2);
    });

});

/**
* // thanks gemini
*
* Sorts the keys of an object alphabetically for testing purposes.
*
* @param obj The object to be sorted.
* @returns A new object with sorted keys.
*/
export function sortObjectForTesting(obj: any): any {
    return Object.fromEntries(Object.entries(obj).sort());
}

await respecfully(maam, `mergeMapsOrArrays_Naive`, async () => {

    await ifWe(maam, 'merges arrays with unique elements', async () => {
        const arr1 = [1, 2, 3];
        const arr2 = [4, 5];
        const result = mergeMapsOrArrays_Naive({ dominant: arr1, recessive: arr2 });

        iReckon(maam, result).willEqual([1, 2, 3, 4, 5]);
    });

    await ifWe(maam, 'merges objects with unique keys', async () => {
        const obj1: any = { a: 1, b: 2 };
        const obj2: any = { c: 3, d: 4 };
        const result = mergeMapsOrArrays_Naive({ dominant: obj1, recessive: obj2 });

        const expectedOutput = { a: 1, b: 2, c: 3, d: 4 };
        const sortedResult = sortObjectForTesting(result);
        const sortedExpected = sortObjectForTesting(expectedOutput);

        // console.dir(sortedResult)
        // console.dir(sortedExpected)

        iReckon(maam, sortedResult).willEqual(sortedExpected);
    });

    // Add more test cases here to cover different scenarios, such as:
    // - Merging arrays with duplicate elements
    // - Merging objects with overlapping keys (non-array/map values)
    // - Handling different data types
    // - Edge cases (empty arrays/objects, null values, etc.)

});
