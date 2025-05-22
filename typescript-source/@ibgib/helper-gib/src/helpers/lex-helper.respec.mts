import { HELPER_LOG_A_LOT } from '../constants.mjs';
import { Lex, LexData, LexDatum, PropsData } from "./lex-helper.mjs";
import { clone, unique } from "./utils-helper.mjs";
import { respecfully, iReckon, ifWe, firstOfEach, ifWeMight } from '../respec-gib/respec-gib.mjs';
let maam = `[${import.meta.url}]`, sir = maam;

const logalot = HELPER_LOG_A_LOT;

// #region copied from robbot in other lib...should be fine here just for testing for now.

/**
 * These are used for raw words/phrases that compose larger, more complex
 * semantic ideas that use SemanticId.
 *
 * Because these are used in composition of lex data, they are not prefixed
 * with something like "atomic_", e.g. "atomic_hi".
 */
export type AtomicId =
    'hi' | 'welcome' | 'bye' |
    'yes' | 'no' |
    'learn' |
    'wtg';
export const AtomicId = {
    hi: 'hi' as AtomicId,
    welcome: 'welcome' as AtomicId,
    bye: 'bye' as AtomicId,
    yes: 'yes' as AtomicId,
    no: 'no' as AtomicId,
    learn: 'learn' as AtomicId,
    wtg: 'wtg' as AtomicId,
}

/**
 * These are used for specific lex commands/intents/whatevers. Synonyms and
 * equivalency phrases ultimately get resolved to these.
 *
 * These are complex concepts, as opposed to the smaller atomic words/phrases, that
 * a robbot will use when interacting with users.
 *
 * ## example
 *
 * A robbot may say in a semantic greeting (SemanticId.hello) that incorporates
 * a lot of context-specific text. However, these individual greetings will
 * most likely include the usage of individual phrases like 'hi' or 'good day'.
 * These are small, raw "atomic" lexical atoms.
 */
export type SemanticId =
    'semantic_help' |
    'semantic_hello' | 'semantic_bye' |
    'semantic_yes' | 'semantic_no' | 'semantic_cancel' |
    'semantic_skip' | 'semantic_forget' | 'semantic_next' |
    'semantic_please' |
    'semantic_in_progress' |
    'semantic_list' |
    'semantic_request' |
    'semantic_count' |
    'semantic_options' |
    'semantic_ready' |
    'semantic_stop' |
    'semantic_result' |
    'semantic_unknown' | 'semantic_default' |
    string; // have to do this for inheritance?
export const SemanticId = {
    help: 'semantic_help' as SemanticId,
    hello: 'semantic_hello' as SemanticId,
    bye: 'semantic_bye' as SemanticId,
    yes: 'semantic_yes' as SemanticId,
    no: 'semantic_no' as SemanticId,
    cancel: 'semantic_cancel' as SemanticId,
    skip: 'semantic_skip' as SemanticId,
    forget: 'semantic_forget' as SemanticId,
    next: 'semantic_next' as SemanticId,
    please: 'semantic_please' as SemanticId,
    in_progress: 'semantic_in_progress' as SemanticId,
    list: 'semantic_list' as SemanticId,
    request: 'semantic_request' as SemanticId,
    count: 'semantic_count' as SemanticId,
    options: 'semantic_options' as SemanticId,
    ready: 'semantic_ready' as SemanticId,
    stop: 'semantic_stop' as SemanticId,
    result: 'semantic_result' as SemanticId,
    unknown: 'semantic_unknown' as SemanticId,
    default: 'semantic_default' as SemanticId,
};

export interface SemanticInfo {
    semanticId?: SemanticId;
    request?: any;
    other?: any;
    isContinuation?: boolean;
}

export interface SemanticHandlerResult {
    interaction: any | null;
    /**
     * Should be set to true if the interaction is aborted (i.e. we're ignoring
     * some stimulus). Like if we're expecting a response, but some other ibgib
     * is given (maybe some users/other robbots are talking and it doesn't
     * pertain to us).
     */
    ignored?: boolean;
    /**
     * If the handler is expecting a response (however the handler may interpret that response),
     *
     */
    // responseSubject?: ReplaySubject<IbGib_V1 | null>;
    // onResponse?: (response: IbGib_V1|null) => Promise<void>;
}
export interface SemanticHandler {
    /**
     * This should be a unique id for this handler.
     */
    handlerId: string;
    /**
     * The semanticId that this handler is associated with.
     */
    semanticId: SemanticId;
    /**
     * If truthy, the robbot should execute this filter before
     * attempting to execute this handler's {@link fnExec}
     */
    fnCanExec: (info: SemanticInfo) => Promise<boolean>;
    /**
     * Actual function of handler that gets executed if context is
     * correct ({@link fnCanHandle} is true).
     */
    fnExec: (info: SemanticInfo) => Promise<SemanticHandlerResult>;
    /**
     * If the user cancels the response and this is truthy, this is called.
     */
    fnCancelResponse?: () => Promise<void>;
    // handleSubject$: ReplaySubject<SemanticInfo>;
    // handleResult$: ReplaySubject<SemanticHandlerResult>;
}

export interface RobbotPropsData<TSemanticId extends SemanticId = SemanticId> extends PropsData {
    /**
     * This datum expects these template vars.
     *
     * This is not strictly necessary, but is used for documentation/aid to the
     * caller on providing stuff for the datum for what is expected.
     */
    templateVars?: string | number | boolean;
    /**
     * If assigned, then this lex datum is a semantic entry, and this is the corresponding
     * semantic id.
     */
    semanticId?: TSemanticId;
    atomicId?: AtomicId;
    /**
     * Only use this lex datum if YES there is an active session in progress.
     */
    onlyInSession?: boolean;
    /**
     * Only use this lex datum if there is NOT an active session in progress.
     */
    onlyNotInSession?: boolean;
    /**
     * The robbot hasn't seen anything so has no knowledge/has nothing to work
     * on.
     */
    blankSlate?: boolean;
    /**
     * Just starting a new session, i.e. no prev interactions exist.
     */
    freshStart?: boolean;
    /**
     * Flag to indicate if the lex datum corresponds to a user request.
     */
    isRequest?: boolean;
}

export function toLexDatums_Semantics(semanticId: SemanticId, texts: string[]): LexDatum<RobbotPropsData>[] {
    return texts.flatMap(t => {
        return {
            texts: [t],
            language: 'en-US',
            props: { semanticId },
        } as LexDatum<RobbotPropsData>;
    });
}
export function toLexDatums_Atomics(atomicId: AtomicId, texts: string[]): LexDatum<RobbotPropsData>[] {
    return texts.flatMap(t => {
        return {
            texts: [t],
            language: 'en-US',
            props: { atomicId },
        } as LexDatum<RobbotPropsData>;
    });
}

export const DEFAULT_HUMAN_LEX_DATA_ENGLISH_SEMANTICS: LexData<RobbotPropsData> = {
    [SemanticId.help]: [
        ...toLexDatums_Semantics(SemanticId.help, [
            'h', 'help', 'help me',
        ]),
    ],
    [SemanticId.yes]: [
        ...toLexDatums_Semantics(SemanticId.yes, [
            'yes', 'y', 'yeah', 'yea', 'aye', 'yup', 'yep', 'sure', 'ok',
            'sounds good', 'go for it', 'yes please', 'yes thanks', 'ok thanks',
            'uh huh', 'god yes', 'affirmative', 'ten four', '10-4', 'roger',
        ]),
    ],
    [SemanticId.no]: [
        ...toLexDatums_Semantics(SemanticId.no, [
            'no', 'n', 'nah', 'nay', 'nope', 'uh uh', 'no thanks', 'ick', 'nuh uh',
            'god no', 'no way', 'not at all', 'negative', 'that\'s a negative', 'nein',
        ])
    ],
    [SemanticId.cancel]: [
        ...toLexDatums_Semantics(SemanticId.cancel, [
            'cancel', 'nm', 'nevermind', 'cancel that', 'don\'t worry about it'
        ])
    ],
    [SemanticId.skip]: [
        ...toLexDatums_Semantics(SemanticId.skip, [
            'skip', 'sk',
        ])
    ],
    [SemanticId.forget]: [
        ...toLexDatums_Semantics(SemanticId.forget, [
            'forget', 'forget this', 'forget this one',
        ])
    ],
    [SemanticId.next]: [
        ...toLexDatums_Semantics(SemanticId.next, [
            'next', // 'next $(please)' /* need to get this kind of thing working */
        ])
    ],
    [SemanticId.bye]: [
        ...toLexDatums_Semantics(SemanticId.bye, [
            'bye', 'bye bye', 'see you later', 'see you',
        ])
    ],
    [SemanticId.unknown]: [
        ...toLexDatums_Semantics(SemanticId.unknown, [
            'are you mocking me, human?', 'mmhmm...', 'i see...', 'does not compute...', 'indeed'
        ])
    ],
};
export const DEFAULT_HUMAN_LEX_DATA_ENGLISH_ATOMICS: LexData<RobbotPropsData> = {
    [AtomicId.hi]: [
        ...toLexDatums_Atomics(AtomicId.hi, [
            'hi', 'howdy', 'hello', 'greetings', 'good day', 'hello there', 'good day to you', 'yo',
        ]),
    ],
    [AtomicId.welcome]: [
        ...toLexDatums_Atomics(AtomicId.welcome, [
            'welcome',
        ]),
    ],
    [AtomicId.yes]: [
        ...toLexDatums_Atomics(AtomicId.yes, [
            'yes', 'y', 'yeah', 'yea', 'aye', 'yup', 'yep', 'sure', 'ok',
            'sounds good', 'go for it', 'yes please', 'yes thanks', 'ok thanks',
            'uh huh', 'god yes', 'affirmative', 'ten four', '10-4', 'roger',
        ]),
    ],
    [AtomicId.no]: [
        ...toLexDatums_Atomics(AtomicId.no, [
            'no', 'n', 'nope', 'no thanks', 'no thank you',
        ]),
    ],
    [AtomicId.bye]: [
        ...toLexDatums_Atomics(AtomicId.bye, [
            'bye', 'bye bye', 'adios', 'ciao', 'later',
        ]),
    ],
    [AtomicId.learn]: [
        ...toLexDatums_Atomics(AtomicId.learn, [
            'learn', 'study', 'review',
        ]),
    ],
    [AtomicId.wtg]: [
        ...toLexDatums_Atomics(AtomicId.wtg, [
            'wtg', 'nice', 'not bad', 'pretty good', 'good job',
        ]),
    ],
}
export const DEFAULT_HUMAN_LEX_DATA_ENGLISH: LexData<RobbotPropsData> = {
    ...DEFAULT_HUMAN_LEX_DATA_ENGLISH_SEMANTICS,
    ...DEFAULT_HUMAN_LEX_DATA_ENGLISH_ATOMICS,
}
export const DEFAULT_HUMAN_LEX_DATA: LexData<RobbotPropsData> = {
    ...clone(DEFAULT_HUMAN_LEX_DATA_ENGLISH),
};

// #endregion copied from robbot in other lib...should be fine here just for testing for now.

await respecfully(sir, 'lex', async () => {
    let testData: LexData<any>;
    let testLex: Lex<any>;

    firstOfEach(sir, async () => {
        testData = { ...clone(DEFAULT_HUMAN_LEX_DATA_ENGLISH) };
        if (logalot) {
            console.log(`[lex firstOfEach] testData... (I: 2eecc9a21726af7caf9bba135e8bc423)`);
            console.dir(testData);
        }
        testLex = new Lex(testData, {});
    });

    await respecfully(sir, 'get', async () => {
        await ifWe(sir, 'semantic ids lookup...(assumes test data has semanticId from robbot helper)', () => {
            Object.keys(testData).forEach(id => {
                const result = testLex.get(id);
                iReckon(sir, result).isGonnaBeTruthy();
                const firstRawDatum = result!.rawData[0];
                iReckon(sir, firstRawDatum).isGonnaBeTruthy();
                iReckon(sir, firstRawDatum.props).isGonnaBeTruthy();
                // iReckon(sir, firstRawDatum.props.semanticId).isGonnaBeTruthy();
                // iReckon(sir, firstRawDatum.props.semanticId).willEqual(id);
            });
        });

        await respecfully(sir, 'template refs', async () => {

            type Term = 'use_aloha' | 'aloha_specifier' | 'fancy' |
                'use_fancy' | 'use_fancy_and_short' |
                'short' | 'bare';
            const Term = {
                'aloha_specifier': 'aloha_specifier' as Term,
                'use_aloha': 'use_aloha' as Term,
                'fancy': 'fancy' as Term,
                'use_fancy': 'use_fancy' as Term,
                'use_fancy_and_short': 'use_fancy_and_short' as Term,
                'short': 'short' as Term,
                'bare': 'bare' as Term,
            }

            let refTestData: LexData<PropsData> = {
                'hi': [
                    { texts: ['hi'] },
                    { texts: ['aloha'], specifier: Term.aloha_specifier },
                    { texts: ['ciao'], keywords: [Term.fancy, Term.short] },
                    { texts: ['greetings'], keywords: [Term.fancy,] }
                ],
                'example_refs': [
                    {
                        // no keywords, specifiers or props, i.e. bare
                        texts: [`$(hi)`],
                    },
                    {
                        specifier: Term.use_aloha,
                        texts: [`$(hi|{"specifier":"${Term.aloha_specifier}"})`],
                    },
                    {
                        specifier: Term.use_fancy,
                        texts: [`$(hi|{"keywords":["${Term.fancy}"]})`],
                    },
                    {
                        specifier: Term.use_fancy_and_short,
                        texts: [`$(hi|{"keywords":["${Term.fancy}","${Term.short}"],"keywordMode":"all"})`],
                    },
                ],
            }
            const getAllTestTexts = (id: string) => {
                return refTestData[id].map(x => (x.texts || []).join(''))
            };

            let lex = new Lex(refTestData, {});
            await ifWe(sir, 'should get all hi\'s eventually', async () => {
                let allGotten: string[] = [];
                // many times to ensure we get each one at least once (probably)
                for (let i = 0; i < 60; i++) {
                    allGotten.push(lex.get('example_refs', {})!.text)
                }
                allGotten = unique(allGotten);
                let allHiTexts = getAllTestTexts('hi');
                iReckon(sir, allHiTexts.every((x: string) => allGotten.includes(x))).isGonnaBeTrue();
            });
            await ifWe(sir, 'should get specifier aloha', () => {
                // multiple times to be sure it is always the same thing
                for (let i = 0; i < 10; i++) {
                    const gottenText = lex.get('example_refs', { specifier: Term.use_aloha })?.text ?? '';
                    iReckon(sir, gottenText).willEqual('aloha');
                }
            });
            await ifWe(sir, 'should get keyword fancy', () => {
                const allFancyTexts = ['ciao', 'greetings'];
                let allGottenTexts: string[] = [];
                // multiple times to be sure it is always the same thing
                for (let i = 0; i < 11; i++) {
                    const gottenText = lex.get('example_refs', { specifier: Term.use_fancy })?.text ?? '';
                    allGottenTexts.push(gottenText);
                    iReckon(sir, allFancyTexts.includes(gottenText)).isGonnaBeTrue();
                }
                // many times to ensure we get each one at least once (probably)
                allGottenTexts = unique(allGottenTexts);
                if (logalot) {
                    console.log(`[should get keyword fancy] allGottenTexts... (I: b4f52acfc715653063a95f9c8958a823)`);
                    console.dir(allGottenTexts);
                }
                iReckon(sir, allFancyTexts.every(x => allGottenTexts.includes(x))).isGonnaBeTrue();
            });
            await ifWe(sir, 'should get keyword fancy and short', () => {
                // multiple times to be sure it is always the same thing
                for (let i = 0; i < 11; i++) {
                    const gottenText = lex.get('example_refs', { specifier: Term.use_fancy_and_short })?.text ?? '';
                    iReckon(sir, gottenText).willEqual('ciao')
                }
            });
        });
    });

    await respecfully(sir, 'find', async () => {
        await ifWe(sir, '"help" predicate looking for text equals exactly "help" should find SemanticId.help with one datum', () => {
            const results = testLex.find({
                fnDatumPredicate: (x => !!x.texts && x.texts.includes('help') && x.props.semanticId === SemanticId.help)
            })!;
            iReckon(sir, results).isGonnaBeTruthy();
            const foundIds = Object.keys(results);
            iReckon(sir, foundIds).isGonnaBeTruthy();
            iReckon(sir, foundIds.length).willEqual(1);
            iReckon(sir, foundIds[0]).isGonnaBeTruthy();
            iReckon(sir, foundIds[0]).willEqual(SemanticId.help);

            let datums = results[SemanticId.help]!;
            iReckon(sir, datums).isGonnaBeTruthy();
            iReckon(sir, datums.length).asTo('atow only expect one entry to exactly equal help').willEqual(1);
            iReckon(sir, datums[0].texts?.join('')).asTo('expect the datum found to have texts === help').isGonnaBe('help');
        });

        await ifWe(sir, '"help" predicate looking for text includes help and SemanticId.help should find multiple datums', () => {
            const results = testLex.find({
                fnDatumPredicate: (x => !!x.texts && x.texts.some(t => t.includes('help')) && x.props.semanticId === SemanticId.help)
            })!;
            iReckon(sir, results).isGonnaBeTruthy();
            const foundIds = Object.keys(results);
            iReckon(sir, foundIds).isGonnaBeTruthy();
            iReckon(sir, foundIds.length).willEqual(1);
            iReckon(sir, foundIds[0]).isGonnaBeTruthy();
            iReckon(sir, foundIds[0]).willEqual(SemanticId.help);

            let datums = results[SemanticId.help];
            iReckon(sir, datums).isGonnaBeTruthy();
            iReckon(sir, datums.length).asTo(`atow expect two entries to include help: "help me" and "help". got: ${datums.map(x => x.texts?.join('|'))}`).isGonnaBe(2);
        });

        await ifWe(sir, 'each human data should map to a single semantic id', () => {
            const dataIds = Object.keys(testData);
            const allSemanticIds = Object.values(SemanticId);
            for (let i = 0; i < dataIds.length; i++) {
                const dataId = dataIds[i];
                if (!allSemanticIds.includes(dataId)) { continue; }

                /** rename to be explicit for tests */
                const semanticId = dataId;

                // for semantic ids, each text should map to one and only one
                // semanticId
                const datums = testData[dataId];
                for (let j = 0; j < datums.length; j++) {
                    const datum = datums[j];
                    if (datum.texts?.length !== 1) { console.dir(datum) }
                    iReckon(sir, datum.texts?.length).willEqual(1);
                    const testText = datum.texts![0];

                    // now do a find for that text, and it should return
                    // the single entry that corresponds to the semantic id
                    //
                    const results = testLex.find({
                        fnDatumPredicate: x =>
                            !!x.props?.semanticId && // only want to find ones corresponding to semantics
                            !!x.texts?.includes(testText) // narrow down to our test text
                    })!;
                    iReckon(sir, results).isGonnaBeTruthy();
                    const resIds = Object.keys(results!);
                    iReckon(sir, resIds).isGonnaBeTruthy();
                    iReckon(sir, resIds.length).willEqual(1);
                    const foundId = resIds[0];
                    iReckon(sir, foundId).willEqual(semanticId);
                }
            }
        });
    });

});
