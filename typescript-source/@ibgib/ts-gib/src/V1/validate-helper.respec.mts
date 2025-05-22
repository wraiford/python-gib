import {
    ifWe, ifWeMight, iReckon, respecfully
} from '@ibgib/helper-gib/dist/respec-gib/respec-gib.mjs';
import { clone, hash } from '@ibgib/helper-gib/dist/helpers/utils-helper.mjs';
const maam = `[${import.meta.url}]`, sir = maam;

import { IbGib_V1, IbGibRel8ns_V1, Rel8n, } from './types.mjs';
import { IB, GIB, IBGIB_DELIMITER } from './constants.mjs';
import { validateIbGibIntrinsically, validateRel8nsIntrinsically } from './validate-helper.mjs';
import { Factory_V1 } from './factory.mjs';
import { getGib } from './transforms/transform-helper.mjs';
import { IbGibAddr } from '../types.mjs';
import { getIbGibAddr } from '../helper.mjs';

const VALID_IBS = [IB, 'yo', 'spaces is cool', 'underscores_yay_woo'];
const INVALID_IBS = [
    `cant have delimiter ^ woo`,
];
const VALID_GIBS: string[] = [
    GIB,
    await hash({ s: 'wakka' }),
];
const INVALID_GIBS: any[] = [
    'not a hash and not primitive gib',
];
const VALID_ADDRS: IbGibAddr[] = [];
for (let i = 0; i < VALID_IBS.length; i++) {
    const ib = VALID_IBS[i];
    for (let j = 0; j < VALID_GIBS.length; j++) {
        const gib = VALID_GIBS[j];
        VALID_ADDRS.push(getIbGibAddr({ ib, gib }));
    }
}
const INVALID_ADDRS: IbGibAddr[] = [
    // picking a couple instead of iterating all
    `${INVALID_IBS.at(0)}^${VALID_GIBS.at(0)}`,
    `${INVALID_IBS.at(0)}^${VALID_GIBS.at(1)}`,
    `${VALID_IBS.at(0)}^${INVALID_GIBS.at(0)}`,
    `${VALID_IBS.at(1)}^${INVALID_GIBS.at(0)}`,
];
const VALID_REL8N_NAMES: string[] = [
    Rel8n.ancestor, Rel8n.dna, Rel8n.identity, Rel8n.past, Rel8n.tjp,
    ...Object.values(Rel8n),
    'some rel8n name with spaces fine',
    'under_scores_are_good too',
    'hyphens-ok-yo go',
    'abc123 123-_ wakka doodle',
];
// const INVALID_REL8N_NAMES: any[] = [
// should be a string
// 1, // apparently numbers get stringified when indexing via them
// { a: 'aa' }, // compiler errors
// ];

await respecfully(sir, `validateIbGibIntrinsically`, async () => {

    await ifWe(sir, `valid primitives`, async () => {
        for (let i = 0; i < VALID_IBS.length; i++) {
            const ib = VALID_IBS[i];
            const ibGib: IbGib_V1 = { ib, gib: GIB }
            iReckon(sir, ibGib).asTo('ibGib').isGonnaBeTruthy();
            const errors = await validateIbGibIntrinsically({ ibGib }) ?? [];
            iReckon(sir, errors.length === 0).asTo('errors').isGonnaBeTrue();
        }
    });

    await respecfully(sir, `invalid primitives`, async () => {
        await ifWe(sir, `invalid ibs`, async () => {
            for (let i = 0; i < INVALID_IBS.length; i++) {
                const ib = INVALID_IBS[i];
                const ibGib: IbGib_V1 = { ib, gib: GIB }
                iReckon(sir, ibGib).asTo('ibGib').isGonnaBeTruthy();
                const errors = await validateIbGibIntrinsically({ ibGib }) ?? [];
                iReckon(sir, errors.length > 0).asTo('errors').isGonnaBeTrue();
            }
        });
    });

    await respecfully(sir, `using firstGen`, async () => {
        for (let i = 0; i < VALID_IBS.length; i++) {
            const ib = VALID_IBS[i];
            const resTransform = await Factory_V1.firstGen({
                parentIbGib: Factory_V1.primitive({ ib }),
                ib,
            });
            const ibGib: IbGib_V1 = resTransform.newIbGib;
            await ifWe(sir, `non-modified -> valid`, async () => {
                iReckon(sir, ibGib).asTo('ibGib').isGonnaBeTruthy();
                const errors = await validateIbGibIntrinsically({ ibGib }) ?? [];
                iReckon(sir, errors.length === 0).asTo('errors').isGonnaBeTrue();
            });
            await ifWe(sir, `modified data before update gib -> invalid`, async () => {
                ibGib.data = { x: "some other data" };
                const errors = await validateIbGibIntrinsically({ ibGib }) ?? [];
                iReckon(sir, errors.length > 0).asTo('errors').isGonnaBeTrue();
            });
            await ifWe(sir, `modified data after update gib -> valid again`, async () => {
                ibGib.gib = await getGib({ ibGib });
                const errors = await validateIbGibIntrinsically({ ibGib }) ?? [];
                iReckon(sir, errors.length === 0).asTo('errors').isGonnaBeTrue();
            });
            await ifWe(sir, `modified gib by single char -> invalid`, async () => {
                // make sure the first char is different
                let tweakedGibCharsArray = ibGib.gib!.split('');
                tweakedGibCharsArray.shift()
                tweakedGibCharsArray.unshift(ibGib.gib![0] === 'a' ? '0' : 'a')
                ibGib.gib = tweakedGibCharsArray.join('');
                const errors = await validateIbGibIntrinsically({ ibGib }) ?? [];
                iReckon(sir, errors.length > 0).asTo('errors').isGonnaBeTrue();
            });
        }
    });
});

await respecfully(sir, `validateRel8nsIntrinsically`, async () => {

    const validRel8ns: IbGibRel8ns_V1 = {};
    for (let i = 0; i < VALID_REL8N_NAMES.length; i++) {
        const rel8nName = VALID_REL8N_NAMES[i];
        validRel8ns[rel8nName] = VALID_ADDRS.concat();
    }

    await ifWe(sir, `check valid rel8ns`, async () => {
        const rel8ns: IbGibRel8ns_V1 = clone(validRel8ns);
        const errors = validateRel8nsIntrinsically({ rel8ns }) ?? [];
        iReckon(sir, errors.length === 0).asTo('errors').isGonnaBeTrue();
    });
    await ifWe(sir, `add invalid addr with valid rel8nName`, async () => {
        for (let i = 0; i < INVALID_ADDRS.length; i++) {
            const rel8ns: IbGibRel8ns_V1 = clone(validRel8ns);
            let errors = validateRel8nsIntrinsically({ rel8ns }) ?? [];
            iReckon(sir, errors.length === 0).asTo('still valid').isGonnaBeTrue();

            const rel8nName = VALID_REL8N_NAMES[0];
            rel8ns[rel8nName] = [INVALID_ADDRS[i]];
            errors = validateRel8nsIntrinsically({ rel8ns }) ?? [];
            iReckon(sir, errors.length > 0).asTo('errors').isGonnaBeTrue();
        }
    });

    // commenting this out because apparently numbers get converted to strings?
    // i can't think of any other possible invalid rel8nNames atow (11/2023)
    // await ifWe(sir, `add valid addr with invalid rel8nName`, async () => {
    //     for (let i = 0; i < INVALID_REL8N_NAMES.length; i++) {
    //         const rel8ns: IbGibRel8ns_V1 = clone(validRel8ns);
    //         let errors = validateRel8nsIntrinsically({ rel8ns }) ?? [];
    //         iReckon(sir, errors.length === 0).asTo('still valid').isGonnaBeTrue();

    //         rel8ns[INVALID_REL8N_NAMES[i]] = VALID_ADDRS.concat();
    //         errors = validateRel8nsIntrinsically({ rel8ns }) ?? [];
    //         iReckon(sir, errors.length > 0).asTo('errors').isGonnaBeTrue();
    //     }
    // });
});
