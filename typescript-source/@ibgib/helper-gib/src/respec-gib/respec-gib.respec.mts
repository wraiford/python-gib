import { respecfully, iReckon, ifWe, firstOfAll, firstOfEach, lastOfAll, lastOfEach, respecfullyDear, ifWeMight } from './respec-gib.mjs';
const maam = `[${import.meta.url}]`, sir = maam;
// console.log(`sir: ${sir}`);
import { TRUTHY_VALUES, FALSY_VALUES } from './respec-gib-constants.mjs';

await respecfully(sir, `first/last setup/teardown functions`, async () => {

    await respecfully(sir, 'firstOfAll only', async () => {
        let firstOfAllTriggered = false;

        firstOfAll(sir, async () => {
            firstOfAllTriggered = true;
        });

        await ifWe(sir, `do an ifWe block, firstOfAll should've triggered`, async () => {
            iReckon(sir, firstOfAllTriggered).isGonnaBeTrue();
        });
    });

    await respecfully(sir, 'firstOfEach only', async () => {
        let firstOfEachObj: any = { x: 0 }
        let lastFirstOfEachValue = 0;

        firstOfEach(sir, async () => {
            lastFirstOfEachValue = firstOfEachObj.x;
            firstOfEachObj.x = firstOfEachObj.x + 1;
        });

        await ifWe(sir, `1 do an ifWe block, firstOfEach should've triggered 1 time(s)`, async () => {
            iReckon(sir, firstOfEachObj.x).willEqual(1);
            iReckon(sir, lastFirstOfEachValue).willEqual(0);
        });
        await ifWe(sir, `2 do an ifWe block, firstOfEach should've triggered 2 time(s)`, async () => {
            iReckon(sir, firstOfEachObj.x).willEqual(2);
            iReckon(sir, lastFirstOfEachValue).willEqual(1);
        });
    });

    await respecfully(sir, 'firstOfAll and firstOfEach', async () => {
        let firstOfAllTriggered = false;
        let firstOfEachObj: any = { x: 0 }
        let lastFirstOfEachValue = 0;

        firstOfAll(sir, async () => {
            firstOfAllTriggered = true;
        });
        firstOfEach(sir, async () => {
            lastFirstOfEachValue = firstOfEachObj.x;
            firstOfEachObj.x = firstOfEachObj.x + 1;
        });

        await ifWe(sir, `do an ifWe block, firstOfAll should've triggered`, async () => {
            iReckon(sir, firstOfAllTriggered).isGonnaBeTrue();
            iReckon(sir, firstOfEachObj.x).willEqual(1);
        });

        await ifWe(sir, `1 do an ifWe block, firstOfEach should've triggered 1 time(s)`, async () => {
            iReckon(sir, firstOfAllTriggered).isGonnaBeTrue();
            iReckon(sir, firstOfEachObj.x).willEqual(2);
        });
        await ifWe(sir, `2 do an ifWe block, firstOfEach should've triggered 2 time(s)`, async () => {
            iReckon(sir, firstOfAllTriggered).isGonnaBeTrue();
            iReckon(sir, firstOfEachObj.x).willEqual(3);
        });
    });

    await respecfully(sir, 'lastOfAll only', async () => {
        let lastOfAllTriggered = false;

        await respecfully(sir, 'lastOfAll only inner test block', async () => {

            lastOfAll(sir, async () => {
                lastOfAllTriggered = true;
            });

            await ifWe(sir, `do an ifWe block, lastOfAll should not yet trigger`, async () => {
                iReckon(sir, lastOfAllTriggered).isGonnaBeFalse();
            });
            await ifWe(sir, `do an ifWe block, lastOfAll should trigger after complete`, async () => {
                iReckon(sir, lastOfAllTriggered).isGonnaBeFalse();
            });
            await ifWe(sir, `do an ifWe block, lastOfAll should trigger after complete`, async () => {
                iReckon(sir, lastOfAllTriggered).isGonnaBeFalse();
            });

        });

        await ifWe(sir, `now do an ifWe block, the previous nested lastOfAll should have triggered`, async () => {
            iReckon(sir, lastOfAllTriggered).isGonnaBeTrue();
        });

    });

    await respecfully(sir, 'lastOfAll and lastOfEach', async () => {
        let lastOfAllTriggered = false;
        let lastOfEachCounter = 0;

        await respecfully(sir, 'lastOfAll only inner test block', async () => {

            lastOfAll(sir, async () => {
                lastOfAllTriggered = true;
            });
            lastOfEach(sir, async () => {
                lastOfEachCounter++;
            });

            await ifWe(sir, `do an ifWe block, lastOfAll should not yet trigger`, async () => {
                iReckon(sir, lastOfAllTriggered).isGonnaBeFalse();
                iReckon(sir, lastOfEachCounter).isGonnaBe(0);
            });
            await ifWe(sir, `do an ifWe block, lastOfAll should trigger after complete`, async () => {
                iReckon(sir, lastOfAllTriggered).isGonnaBeFalse();
                iReckon(sir, lastOfEachCounter).isGonnaBe(1);
            });
            await ifWe(sir, `do an ifWe block, lastOfAll should trigger after complete`, async () => {
                iReckon(sir, lastOfAllTriggered).isGonnaBeFalse();
                iReckon(sir, lastOfEachCounter).isGonnaBe(2);
            });

        });

        await ifWe(sir, `now do an ifWe block, the previous nested lastOfAll should have triggered`, async () => {
            iReckon(sir, lastOfAllTriggered).isGonnaBeTrue();
            iReckon(sir, lastOfEachCounter).isGonnaBe(3);
        });

        await ifWe(sir, `now do another outer ifWe block, the inner fns should not have fired`, async () => {
            iReckon(sir, lastOfAllTriggered).isGonnaBeTrue(); // still
            iReckon(sir, lastOfEachCounter).isGonnaBe(3); // still
        });

    });

    let counter = 0;
    counter++;
    if (![1].includes(counter)) { throw new Error(`counter should be 1 (E: 84cba50a1fa849f699b4c9d0f711addd)`); }

    await respecfully(sir, 'complex nested blocks with first/lastOfAll/Each', async () => {
        // ok this one is tricky. we want to be sure that the inner blocks
        // execute before outer blocks. but that outer block hooks execute for
        // each inner block.
        // 1. firstOfAll executes when the first inner block is opened,
        //    be it an ifWe or respecfully block
        // 2. firstOfEach executes within **every** inWe block (direct
        //    child/grandchild/etc. block), executing in outermost block first
        //    and working inwards.
        // 2. lastOfEach executes within **every** inWe block (direct
        //    child/grandchild/etc. block), executing in innermost block first
        //    and working outwards.
        // 3. lastOfAll executes when respecfully block closes.
        counter++;
        if (![2].includes(counter)) { throw new Error(`counter should be 2 (E: 933ca5442ebb4c0e9d0c7e644ee542cd)`); }

        // each of these functions queues up the respective bodies but does not
        // yet execute
        firstOfAll(sir, async () => {
            counter++;
            if (![7].includes(counter)) { throw new Error(`counter should be 7 (E: 0d47c32f66a443d19bfa9d939eb4020d)`); }
        });

        counter++;
        if (![3].includes(counter)) { throw new Error(`counter should be 3 (E: 82de6eda273547fab6000a3b650ad0f3)`); }

        firstOfEach(sir, async () => {
            counter++
            if (![14, 20, 26, 34, 38].includes(counter)) { throw new Error(`counter should be 14, 20, 26, 34, or 38 (E: 634597a48db5412b99b470c33e9d7c77)`); }
        });

        counter++
        if (![4].includes(counter)) { throw new Error(`counter should be 4 (E: 11a030a8456f4ea7a33e957e6dce5def)`); }

        lastOfAll(sir, async () => {
            counter++
            if (![42].includes(counter)) { throw new Error(`counter should be 42 (E: d010d3f96f9d4ba1b60ee003840dc660)`); }
        });

        counter++
        if (![5].includes(counter)) { throw new Error(`counter should be 5 (E: 2cbd02f5a4704cc7bce8ea2c338689f2)`); }

        lastOfEach(sir, async () => {
            counter++
            if (![18, 24, 30, 36, 40].includes(counter)) { throw new Error(`counter should be [18, 24, 30, 36, 40] (E: 98662492cfa64807877b95566b3d6ee4)`); }
        });

        counter++
        if (![6].includes(counter)) { throw new Error(`counter should be 6 (E: ba8bb86fc17647ebbc0bdc5a237874a0)`); }

        await respecfully(sir, 'lastOfAll only inner test block', async () => {
            counter++
            if (![8].includes(counter)) { throw new Error(`counter should be 8 (E: 0090bafa914a48128a83a12d1233c6b6)`); }

            firstOfAll(sir, async () => {
                counter++
                if (![13].includes(counter)) { throw new Error(`counter should be 13 (E: 59f2a4b7e1404171b6d43ffd7a5fc131)`); }
            });

            counter++
            if (![9].includes(counter)) { throw new Error(`counter should be 9 (E: 2e51935b657a4f589300ae0a9fadbc9d)`); }

            firstOfEach(sir, async () => {
                counter++
                if (![15, 21, 27].includes(counter)) { throw new Error(`counter should be [15, 21, 27] (E: 3aef380a187a479baabeb38495ceec55)`); }
            });

            counter++
            if (![10].includes(counter)) { throw new Error(`counter should be [10] (E: 6d6685e70b9b40378c4a0bb6ccc4e2e7)`); }

            lastOfAll(sir, async () => {
                counter++
                if (![32].includes(counter)) { throw new Error(`counter should be [32] (E: d6df1c49040b476f88b35bc2aa667af8)`); }
            });

            counter++
            if (![11].includes(counter)) { throw new Error(`counter should be [11] (E: 60eb478afc1f4e8c9194954e42929ae3)`); }

            lastOfEach(sir, async () => {
                counter++
                if (![17, 23, 29].includes(counter)) { throw new Error(`counter should be [17, 23, 29] (E: 62c2029c33ef4fe6b52c98000e22a6e1)`); }
            });

            counter++
            if (![12].includes(counter)) { throw new Error(`counter should be [12] (E: 02032e60737a43b890846e9046c64b0b)`); }

            await ifWe(sir, `do an ifWe block, lastOfAll should not yet trigger`, async () => {
                counter++
                if (![16].includes(counter)) { throw new Error(`counter should be [16] (E: 47db9f387cfe4f0d8c0a7953964aa715)`); }
                iReckon(sir, counter).isGonnaBe(16);
            });

            counter++
            if (![19].includes(counter)) { throw new Error(`counter should be [19] (E: 5d224c6844cb4ddf99a84dbb6cabc4d2)`); }

            await ifWe(sir, `do an ifWe block, lastOfAll should trigger after complete`, async () => {
                counter++
                if (![22].includes(counter)) { throw new Error(`counter should be [22] (E: 0e63a7eef88e4b4085e15e0cf8b93cb0)`); }
                iReckon(sir, counter).isGonnaBe(22);
            });

            counter++
            if (![25].includes(counter)) { throw new Error(`counter should be [25] (E: 085276b89a7f47c5bffec20232e1965e)`); }

            await ifWe(sir, `do an ifWe block, lastOfAll should trigger after complete`, async () => {
                counter++
                if (![28].includes(counter)) { throw new Error(`counter should be [28] (E: 983f5090bac84e938420a341228624c3)`); }
                iReckon(sir, counter).isGonnaBe(28);
            });

            counter++
            if (![31].includes(counter)) { throw new Error(`counter should be [31] (E: 1213e70b183446c4b513bd754e762696)`); }

        });

        counter++
        if (![33].includes(counter)) { throw new Error(`counter should be [33] (E: a77475b0b36d4aff8e5cfb68dd5ee9f9)`); }

        await ifWe(sir, `now do an ifWe block, the previous nested lastOfAll should have triggered`, async () => {
            counter++
            if (![35].includes(counter)) { throw new Error(`counter should be [35] (E: feee32ee3a1b408a832960e5b1b44137)`); }
            iReckon(sir, counter).isGonnaBe(35);
        });

        counter++
        if (![37].includes(counter)) { throw new Error(`counter should be [37] (E: 37b6bec93faa43e186b5efcb31ff53b2)`); }

        await ifWe(sir, `now do another outer ifWe block, the inner fns should not have fired`, async () => {
            counter++
            if (![39].includes(counter)) { throw new Error(`counter should be [39] (E: 9a00b134122a448f8d10ec9dfbddd4ef)`); }
            iReckon(sir, counter).isGonnaBe(39);
        });

        counter++
        if (![41].includes(counter)) { throw new Error(`counter should be [41] (E: b4427d28116848cfa6f51634f703da00)`); }

    });

    counter++
    if (![43].includes(counter)) { throw new Error(`counter should be [43] (E: c22ebf55dda74abba3c2cfbf3a9f2799)`); }

    await ifWe(sir, `test previous block's first/lastAll fns`, async () => {
        counter++
        if (![44].includes(counter)) { throw new Error(`counter should be [44] (E: e04d1d69b9e648cdbc6c20fa5fb0a518)`); }
        iReckon(sir, counter).isGonnaBe(44);
    });

    counter++
    if (![45].includes(counter)) { throw new Error(`counter should be [45] (E: 63c631d397914f009eb33c5c2af86049)`); }
});

await respecfully(sir, 'when warning wha...', async () => {
    await ifWe(sir, 'testing empty ifWe warning IGNORE THIS WARNING YO', async () => { });
});

await respecfully(sir, 'nested outer', async () => {
    await ifWe(sir, 'ifWe before nested inner', () => {
        iReckon(sir, true).isGonnaBeTrue();
    });
    await respecfully(sir, 'nested inner respecfully', async () => {
        await ifWe(sir, 'ifWe inside nested inner', () => {
            iReckon(sir, true).isGonnaBeTrue();
        });
    });
});

await respecfully(sir, `Reckoning methods`, async () => {

    await respecfully(sir, 'asTo (also tests justMetaTesting)', async () => {
        await ifWe(sir, 'should add the extra label context with a failed reckoning', () => {
            const reckoning = iReckon(sir, true).asTo('extra msg 42').isGonnaBeFalse({ justMetaTesting: true });
            iReckon(sir, reckoning.failMsg).includes('extra msg 42');
        })
    });

    await respecfully(sir, 'willEqual', async () => {
        await ifWe(sir, 'have two numbers', () => {
            iReckon(sir, 1).willEqual(1);
            iReckon(sir, 1).not.willEqual(2);
        });
        await ifWe(sir, 'have two strings', () => {
            iReckon(sir, 'string 1').willEqual('string 1');
            iReckon(sir, 'string 2').not.willEqual('string 1');
        });
        await ifWe(sir, 'have two booleans', () => {
            iReckon(sir, true).willEqual(true);
            iReckon(sir, true).not.willEqual(false);
        });
        await ifWe(sir, 'compare the same object to itself', () => {
            const a = { x: 1, b: 2 };
            iReckon(sir, a).willEqual(a);
        });
        await ifWe(sir, 'compare the same object to another simple object with same values', () => {
            const a = { x: 1, b: 2 };
            const b = { x: 1, b: 2 };
            iReckon(sir, a).willEqual(b);
        });
    });

    await respecfully(sir, 'isGonnaBe', async () => {
        await ifWe(sir, 'have two numbers', () => {
            iReckon(sir, 1).isGonnaBe(1);
            iReckon(sir, 1).not.isGonnaBe(2);
        });
        await ifWe(sir, 'have two strings', () => {
            iReckon(sir, 'string 1').isGonnaBe('string 1');
            iReckon(sir, 'string 2').not.isGonnaBe('string 1');
        });
        await ifWe(sir, 'have two booleans', () => {
            iReckon(sir, true).isGonnaBe(true);
            iReckon(sir, true).not.isGonnaBe(false);
        });
        await ifWe(sir, 'compare the same object to itself', () => {
            const a = { x: 1, b: 2 };
            iReckon(sir, a).isGonnaBe(a);
        });
        await ifWe(sir, 'compare the same object to another simple object with same values', () => {
            const a = { x: 1, b: 2 };
            const b = { x: 1, b: 2 };
            iReckon(sir, a).isGonnaBe(b);
        });
    });

    await respecfully(sir, 'isGonnaBeTruthy', async () => {

        await ifWe(sir, 'do some truthy values', () => {
            for (let i = 0; i < TRUTHY_VALUES.length; i++) {
                const value = TRUTHY_VALUES[i];
                iReckon(sir, value).isGonnaBeTruthy();
            }
            for (let i = 0; i < TRUTHY_VALUES.length; i++) {
                const value = TRUTHY_VALUES[i];
                const reckoning = iReckon(sir, value).not.isGonnaBeTruthy({ justMetaTesting: true });
                iReckon(sir, reckoning.failMsg).isGonnaBeTruthy();
            }
        });
        await ifWe(sir, 'do some falsy values', () => {
            for (let i = 0; i < FALSY_VALUES.length; i++) {
                const value = FALSY_VALUES[i];
                const reckoning = iReckon(sir, value).isGonnaBeTruthy({ justMetaTesting: true });
                iReckon(sir, reckoning.failMsg).isGonnaBeTruthy();
            }
            for (let i = 0; i < FALSY_VALUES.length; i++) {
                const value = FALSY_VALUES[i];
                iReckon(sir, value).not.isGonnaBeTruthy();
            }
        });
    });

    await respecfully(sir, 'isGonnaBeFalsy', async () => {

        await ifWe(sir, 'do some falsy values', () => {
            for (let i = 0; i < FALSY_VALUES.length; i++) {
                const value = FALSY_VALUES[i];
                iReckon(sir, value).isGonnaBeFalsy();
            }
            for (let i = 0; i < FALSY_VALUES.length; i++) {
                const value = FALSY_VALUES[i];
                const reckoning = iReckon(sir, value).not.isGonnaBeFalsy({ justMetaTesting: true });
                iReckon(sir, reckoning.failMsg).isGonnaBeTruthy(); // the failMsg** is truthy!
            }
        });
        await ifWe(sir, 'do some truthy values', () => {
            for (let i = 0; i < TRUTHY_VALUES.length; i++) {
                const value = TRUTHY_VALUES[i];
                const reckoning = iReckon(sir, value).isGonnaBeFalsy({ justMetaTesting: true });
                iReckon(sir, reckoning.failMsg).isGonnaBeTruthy(); // the failMsg** is truthy!
            }
            for (let i = 0; i < TRUTHY_VALUES.length; i++) {
                const value = TRUTHY_VALUES[i];
                iReckon(sir, value).not.isGonnaBeFalsy();
            }
        });
    });

    await respecfully(sir, 'isGonnaBeTrue', async () => {

        await ifWe(sir, 'say true is true', () => {
            iReckon(sir, true).isGonnaBeTrue();
        });

        await ifWe(sir, 'use the not modifier', () => {
            iReckon(sir, false).not.isGonnaBeTrue();
        });

        await ifWe(sir, 'reckon false is not true, with justMetaTesting', () => {
            const reckoning = iReckon(sir, false).isGonnaBeTrue({ justMetaTesting: true });
            iReckon(sir, reckoning.failMsg).isGonnaBeTruthy();
        });

    });

    await respecfully(sir, 'isGonnaBeFalse', async () => {

        await ifWe(sir, 'say false is false', () => {
            iReckon(sir, false).isGonnaBeFalse();
        });

        await ifWe(sir, 'use the not modifier', () => {
            iReckon(sir, false).not.isGonnaBeTrue();
        });

        await ifWe(sir, 'reckon true is not false, with justMetaTesting', () => {
            const reckoning = iReckon(sir, true).isGonnaBeFalse({ justMetaTesting: true });
            iReckon(sir, reckoning.failMsg).isGonnaBeTruthy();
        });

    });

    await respecfully(sir, 'isGonnaBeUndefined', async () => {

        await ifWe(sir, 'test undefined', () => {
            iReckon(sir, undefined).isGonnaBeUndefined();

            const reckoning = iReckon(sir, undefined).not.isGonnaBeUndefined({ justMetaTesting: true });
            iReckon(sir, reckoning.failMsg).isGonnaBeTruthy();
        });

        await ifWe(sir, 'test truthy values', () => {

            TRUTHY_VALUES.forEach(truthyValue => {
                const reckoning = iReckon(sir, truthyValue).isGonnaBeUndefined({ justMetaTesting: true });
                iReckon(sir, reckoning.failMsg).isGonnaBeTruthy();

                iReckon(sir, truthyValue).not.isGonnaBeUndefined();
            });

        });

        await ifWe(sir, 'test falsy but not undefined values', () => {

            [false, 0, '', null].forEach(falsyValue => {
                const reckoning = iReckon(sir, falsyValue).isGonnaBeUndefined({ justMetaTesting: true });
                iReckon(sir, reckoning.failMsg).isGonnaBeTruthy();

                iReckon(sir, falsyValue).not.isGonnaBeUndefined();
            });

        });

    });

    await respecfully(sir, 'includes', async () => {

        await respecfully(sir, 'member in array', async () => {

            await ifWe(sir, 'test numbers in arrays', () => {
                iReckon(sir, [1, 2, 3]).includes(1);
                iReckon(sir, [1, 2, 3]).not.includes('a');
                iReckon(sir, [1, 2, 3]).not.includes(4, { addedMsg: 'added msg yo' });
            });

            await ifWe(sir, 'test strings in arrays', () => {
                const strings = ['abc', 'dos', 'three'];
                strings.forEach(s => {
                    iReckon(sir, strings).includes(s);
                });
                iReckon(sir, strings).asTo('partial string').not.includes('a');
            });

        });

        await respecfully(sir, 'string in a string', async () => {
            const abcd = 'abcd efg hijklmno';

            await ifWe(sir, 'test substring', () => {
                iReckon(sir, abcd).includes('efg ');
            });

            await ifWe(sir, 'test for not inclusion', () => {
                ['z', 'a bc', 0, { x: 1 }, false].forEach(x => {
                    iReckon(sir, abcd).not.includes(x);
                });
            });

        });
    });

});
