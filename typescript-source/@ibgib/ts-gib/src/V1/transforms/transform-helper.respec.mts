/**
 * Test transform-helper.
 */

import {
    firstOfEach, firstOfAll, ifWe,
    lastOfEach, lastOfAll,
    ifWeMight, iReckon, respecfully,
    respecfullyDear
} from '@ibgib/helper-gib/dist/respec-gib/respec-gib.mjs';
const maam = `[${import.meta.url}]`, sir = maam;

import { fork } from './fork.mjs';
import { Factory_V1 as factory } from '../factory.mjs';
import { isDna } from './transform-helper.mjs';

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

await respecfully(sir, `isDna`, async () => {
    for (const src of PRIMITIVE_IBGIBS) {

        await ifWe(sir, `should return true for dna ibgibs`, async () => {
            const resFork = await fork({ src, dna: true });
            resFork.dnas?.every(x => {
                const resIsDna = isDna({ ibGib: x });
                iReckon(sir, resIsDna).isGonnaBeTrue()
            });
        });

        await ifWe(sir, `should return false for non-dna ibgibs`, async () => {
            const resFork = await fork({ src, dna: true });
            const resIsDna = isDna({ ibGib: resFork.newIbGib });
            iReckon(sir, resIsDna).isGonnaBeFalse();
        });

    }
});
