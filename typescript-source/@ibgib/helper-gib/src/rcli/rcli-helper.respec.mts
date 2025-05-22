import {
    getTimestamp, getSaferSubstring, getTimestampInTicks, pickRandom,
    pickRandom_Letters, replaceCharAt, hash, HashAlgorithm, getUUID, clone, extractErrorMsg,
} from "../helpers/utils-helper.mjs";

import { RCLIArgInfo, RCLIArgType, RCLIParamInfo } from './rcli-types.mjs';
import {
    argIs, buildArgInfos, extractArgValue, getParamInfo, getValueFromRawString,
    parseRawArg
} from './rcli-helper.mjs';

import { respecfully, iReckon, ifWe, ifWeMight, respecfullyDear, } from '../respec-gib/respec-gib.mjs';
import { PARAM_INFO_BARE } from "./rcli-constants.mjs";
let maam = `[${import.meta.url}]`, sir = maam;

// #region test data

const TEST_PARAM_INFO_STRING_SINGLE: RCLIParamInfo = {
    name: 'testparam-string-single',
    synonyms: ['tpss'],
    argTypeName: 'string',
    isFlag: false,
    allowMultiple: false,
};

const TEST_ARG_INFOS_TPSS: RCLIArgInfo[] = [
    {
        ...TEST_PARAM_INFO_STRING_SINGLE,
        value: "wakka",
    }
];

const TEST_PARAM_INFO_NUMBER_SINGLE: RCLIParamInfo = {
    name: 'testparam-number-single',
    synonyms: ['tpns'],
    argTypeName: 'integer',
    isFlag: false,
    allowMultiple: false,
};

/**
 * test param number single
 */
const TEST_ARG_INFOS_TPNS: RCLIArgInfo<RCLIArgType>[] = [
    {
        ...TEST_PARAM_INFO_NUMBER_SINGLE,
        value: 42,
    }
];

const TEST_PARAM_INFO_STRING_WITH_SPACES: RCLIParamInfo = {
    name: 'string-with-spaces',
    synonyms: ['sws'],
    argTypeName: 'string',
    isFlag: false,
    allowMultiple: false,
};
const TEST_ARG_STRING_WITH_SPACES: RCLIArgInfo<string> = {
    ...TEST_PARAM_INFO_STRING_WITH_SPACES,
    value: 'this has spaces',
}

const TEST_PARAM_INFO_BOOLEAN_SINGLE: RCLIParamInfo = {
    name: 'testparam-boolean-single',
    synonyms: ['tpbs'],
    argTypeName: 'boolean',
    isFlag: true,
};

const TEST_ARG_INFOS_TPBS: RCLIArgInfo<RCLIArgType>[] = [
    {
        ...TEST_PARAM_INFO_BOOLEAN_SINGLE,
        value: true,
    }
];

const TEST_PARAM_INFOS: RCLIParamInfo[] = [
    TEST_PARAM_INFO_STRING_SINGLE,
    TEST_PARAM_INFO_NUMBER_SINGLE,
    TEST_PARAM_INFO_BOOLEAN_SINGLE,
];

// #endregion test data


await respecfully(sir, `getValueFromRawString`, async () => {

    await ifWe(sir, `pass in bare string value`, async () => {
        let castedValue = getValueFromRawString<string>({
            paramInfo: TEST_PARAM_INFO_STRING_SINGLE,
            valueString: `wakka`,
        });
        iReckon(sir, castedValue).isGonnaBeTruthy();
        iReckon(sir, typeof castedValue).isGonnaBe('string');
        iReckon(sir, castedValue).isGonnaBe('wakka');
    });
    await ifWe(sir, `pass in string value wrapped with double quotes`, async () => {
        let castedValue = getValueFromRawString<string>({
            paramInfo: TEST_PARAM_INFO_STRING_SINGLE,
            valueString: `"wakka"`,
        });
        iReckon(sir, castedValue).asTo('stripping quotes').isGonnaBe('wakka');
    });
    await ifWe(sir, `pass in string value wrapped with single quotes`, async () => {
        let castedValue = getValueFromRawString<string>({
            paramInfo: TEST_PARAM_INFO_STRING_SINGLE,
            valueString: `'wakka'`,
        });
        iReckon(sir, castedValue).asTo('stripping quotes').isGonnaBe('wakka');
    });

});

await respecfully(sir, `extractArgValue`, async () => {

    await respecfully(sir, `simple arg info value`, async () => {

        await ifWe(sir, `string`, () => {
            const rawValue = extractArgValue<string>({
                paramInfo: TEST_PARAM_INFO_STRING_SINGLE,
                argInfos: TEST_ARG_INFOS_TPSS,
            }) as string;
            iReckon(sir, rawValue).isGonnaBe(TEST_ARG_INFOS_TPSS[0].value);
            iReckon(sir, rawValue).isGonnaBe('wakka');
        });
        await ifWe(sir, `number`, () => {
            const rawValue = extractArgValue<number>({
                paramInfo: TEST_PARAM_INFO_NUMBER_SINGLE,
                argInfos: TEST_ARG_INFOS_TPNS,
            }) as number;
            iReckon(sir, rawValue).isGonnaBe(TEST_ARG_INFOS_TPNS[0].value);
            iReckon(sir, rawValue).isGonnaBe(42);
        });
        await ifWe(sir, `boolean`, () => {
            const rawValue = extractArgValue<boolean>({
                paramInfo: TEST_PARAM_INFO_BOOLEAN_SINGLE,
                argInfos: TEST_ARG_INFOS_TPBS,
            }) as boolean;
            iReckon(sir, rawValue).isGonnaBe(TEST_ARG_INFOS_TPBS[0].value);
            iReckon(sir, rawValue).isGonnaBeTrue();
        });

    });

});

await respecfully(sir, `getParamInfo`, async () => {

    await ifWe(sir, `get by param name`, async () => {
        let info = getParamInfo({
            argIdentifier: TEST_PARAM_INFO_STRING_SINGLE.name,
            paramInfos: TEST_PARAM_INFOS,
            throwIfNotFound: true,
        })!;
        iReckon(sir, info).isGonnaBeTruthy();
        iReckon(sir, info.name).isGonnaBe(TEST_PARAM_INFO_STRING_SINGLE.name);
    });

    await ifWe(sir, `get by param synonym`, async () => {
        const synonym = TEST_PARAM_INFO_STRING_SINGLE.synonyms![0];
        let info = getParamInfo({
            argIdentifier: synonym,
            paramInfos: TEST_PARAM_INFOS,
            throwIfNotFound: true,
        })!;
        iReckon(sir, info).isGonnaBeTruthy();
        iReckon(sir, info.name).isGonnaBe(TEST_PARAM_INFO_STRING_SINGLE.name);
    });

});

await respecfully(sir, `parseRawArg`, async () => {

    await respecfully(sir, `prefixed`, async () => {
        const prefixes = ['-', '--', ':'];
        for (let i = 0; i < prefixes.length; i++) {

            await respecfully(sir, `words/commands`, async () => {
                const bareArgs = ['init', 'arg-onedash', 'arg-multiple-dashes'];
                for (let j = 0; j < bareArgs.length; j++) {
                    const prefix_in = prefixes[i];
                    const bareArg_in = bareArgs[j];
                    const rawArg_in = (prefix_in ?? '') + bareArg_in;

                    await ifWe(sir, `${prefix_in},${bareArg_in},${rawArg_in}`, async () => {
                        let rawArgInfo = parseRawArg({ rawArg: rawArg_in });
                        const prefix_out = rawArgInfo.prefix;
                        const bareArg_out = rawArgInfo.identifier;
                        iReckon(sir, prefix_out).asTo('prefix').isGonnaBe(prefix_in);
                        iReckon(sir, bareArg_out).asTo('bareArg').isGonnaBe(bareArg_in);
                    });
                }
            });

        }
    });

    await respecfully(sir, `bare`, async () => {


        await respecfully(sir, `words/commands`, async () => {
            const bareArgs = ['init', 'arg-onedash', 'arg-multiple-dashes'];
            for (let i = 0; i < bareArgs.length; i++) {
                const prefix_in = undefined;
                const bareArg_in = bareArgs[i];
                const rawArg_in = (prefix_in ?? '') + bareArg_in;

                await ifWe(sir, `${bareArg_in},${rawArg_in}`, async () => {
                    let rawArgInfo = parseRawArg({ rawArg: rawArg_in });
                    const { prefix, identifier, isNameValuePair, valueInfo } = rawArgInfo;
                    if (!valueInfo) { throw new Error(`valueInfo should be truthy (E: 2ae8c561eefa4cb4b602f3800ddd5863)`); }
                    const { singleQuoted, doubleQuoted, rawValueString, resolvedValueString } = valueInfo;

                    iReckon(sir, prefix).asTo('prefix').isGonnaBeUndefined();
                    iReckon(sir, identifier).asTo('identifier').isGonnaBeUndefined();
                    iReckon(sir, isNameValuePair).asTo('isNameValuePair').isGonnaBeFalse();
                    iReckon(sir, singleQuoted).asTo('singleQuoted').isGonnaBe(rawArg_in.startsWith("'"));
                    iReckon(sir, doubleQuoted).asTo('doubleQuoted').isGonnaBe(rawArg_in.startsWith('"'));
                    iReckon(sir, rawValueString).asTo('rawValueString').isGonnaBe(rawArg_in);

                    // todo: implement resolvedValueString tests - too many cases right now
                    // iReckon(sir, resolvedValueString).asTo('resolvedValueString').isGonnaBe();
                });
            }
        });

        await respecfully(sir, `paths`, async () => {

            const rawArgs = [
                '.', '"."', "'.'",
                'file.ext', './file.ext', '../file.ext',
                '/rootfile.ext', '/root/subfile.ext1',
                '/root/pathnoslashatend', '/root/pathendingslash/',
                '"path with spaces in quotes.x"',
                "~/tilde/path", "~/tilde/path.fileext",
                ".dotfile", ".ibgibignore",
            ];
            for (let i = 0; i < rawArgs.length; i++) {
                const rawArg_in = rawArgs[i];

                await ifWe(sir, rawArg_in, async () => {
                    try {
                        const rawArgInfo = parseRawArg({ rawArg: rawArg_in });
                        const { prefix, identifier, isNameValuePair, valueInfo } = rawArgInfo;
                        if (!valueInfo) { throw new Error(`valueInfo should be truthy (E: 0c6f8ad7947436d15ae595bb5280a224)`); }
                        const { singleQuoted, doubleQuoted, rawValueString, resolvedValueString } = valueInfo;

                        iReckon(sir, prefix).asTo('prefix').isGonnaBeFalsy();
                        iReckon(sir, identifier).asTo('identifier').isGonnaBeFalsy();
                        iReckon(sir, isNameValuePair).asTo('isNameValuePair').isGonnaBeFalse();
                        iReckon(sir, singleQuoted).asTo('singleQuoted').isGonnaBe(rawArg_in.startsWith("'"));
                        iReckon(sir, doubleQuoted).asTo('doubleQuoted').isGonnaBe(rawArg_in.startsWith('"'));
                        iReckon(sir, rawValueString).asTo('rawValueString').isGonnaBe(rawArg_in);

                        // todo: implement resolvedValueString tests - too many cases right now
                        // iReckon(sir, resolvedValueString).asTo('resolvedValueString').isGonnaBe();
                    } catch (error) {
                        iReckon(sir, error).asTo('errored').isGonnaBeFalsy();
                    }
                });
            }
        });

    });

});

await respecfully(sir, `argIs`, async () => {

    await respecfully(sir, `by name`, async () => {
        await ifWe(sir, `argIs positive case`, async () => {
            let resArgIs = argIs({
                arg: '--' + TEST_PARAM_INFO_STRING_SINGLE.name,
                paramInfo: TEST_PARAM_INFO_STRING_SINGLE,
                argInfoIndex: 0,
            });
            iReckon(sir, resArgIs).isGonnaBeTrue();
        });
        await ifWe(sir, `argIs negative case`, async () => {
            let resArgIs = argIs({
                arg: '--thisAintTheParamName',
                paramInfo: TEST_PARAM_INFO_STRING_SINGLE,
                argInfoIndex: 0,
            });
            iReckon(sir, resArgIs).isGonnaBeFalse();
        });
    });

    await respecfully(sir, `by synonym`, async () => {
        await ifWe(sir, `argIs positive case`, async () => {
            let resArgIs = argIs({
                arg: '--' + TEST_PARAM_INFO_STRING_SINGLE.synonyms![0],
                paramInfo: TEST_PARAM_INFO_STRING_SINGLE,
                argInfoIndex: 0,
            });
            iReckon(sir, resArgIs).isGonnaBeTrue();
            iReckon(sir, resArgIs).isGonnaBeTrue();
        });
        await ifWe(sir, `argIs negative case`, async () => {
            let resArgIs = argIs({
                arg: '--thisAintASynonymEither',
                paramInfo: TEST_PARAM_INFO_STRING_SINGLE,
                argInfoIndex: 0,
            });
            iReckon(sir, resArgIs).isGonnaBeFalse();
        });
    });

});

await respecfully(sir, `buildArgInfos`, async () => {


    await ifWe(sir, `match one arg against multiple param infos`, async () => {
        let argInfos = buildArgInfos({
            args: ['--testparam-string-single="wakka"'],
            paramInfos: TEST_PARAM_INFOS,
        });
        iReckon(sir, argInfos).isGonnaBeTruthy();
        iReckon(sir, argInfos.length).isGonnaBe(1);
        iReckon(sir, argInfos[0].name).isGonnaBe(TEST_PARAM_INFO_STRING_SINGLE.name);
    });

    await ifWe(sir, `have a value with space(s)`, async () => {
        let argInfos = buildArgInfos({
            args: ['--string-with-spaces="value with spaces"'],
            paramInfos: [
                TEST_PARAM_INFO_STRING_WITH_SPACES,
            ],
        });
        iReckon(sir, argInfos).isGonnaBeTruthy();
        iReckon(sir, argInfos.length).isGonnaBe(1);
        iReckon(sir, argInfos[0].name).isGonnaBe(TEST_PARAM_INFO_STRING_WITH_SPACES.name);
        iReckon(sir, argInfos[0].value).isGonnaBe('value with spaces');
    });

    await ifWe(sir, `identify arg by synonym, the argInfo.name should be the param.name not synonym`, () => {
        const synonym = TEST_PARAM_INFO_STRING_SINGLE.synonyms![0];
        const value = 'some value here';
        const argInfos = buildArgInfos({
            args: [`--${synonym}=${value}`],
            paramInfos: [TEST_PARAM_INFO_STRING_SINGLE],
        });
        const argInfo = argInfos[0];
        iReckon(sir, argInfo.name).isGonnaBe(TEST_PARAM_INFO_STRING_SINGLE.name);
        iReckon(sir, argInfo.name).not.isGonnaBe(synonym);
    });

    await respecfully(sir, `are working with bare arg related things...`, async () => {

        await ifWe(sir, `do not provide a bare arg param info`, () => {
            const bareArgValue = 'bare arg here';
            const bareArgValue_InDoubleQuotes = `"${bareArgValue}"`;

            /**
             * not really an important param, just to have some other param in the
             * list for testing with bare args
             */
            const otherParam = clone(TEST_PARAM_INFO_STRING_SINGLE);
            const otherArgValue = '"some value here"';

            const argInfos = buildArgInfos({
                args: [
                    TEST_PARAM_INFO_BOOLEAN_SINGLE.name, // first positional arg can't be just quoted bare, doesn't count as the bare arg
                    bareArgValue_InDoubleQuotes,
                    `--${otherParam.name}=${otherArgValue}`
                ],
                paramInfos: [TEST_PARAM_INFO_BOOLEAN_SINGLE, TEST_PARAM_INFO_STRING_SINGLE], // we don't have to include the PARAM_INFO_BARE in the paramInfos...
                // bareArgParamInfo: undefined, // just showing this is falsy
            });

            iReckon(sir, argInfos.length).asTo("argInfos.length").isGonnaBe(3);

            iReckon(sir, argInfos[0]).isGonnaBeTruthy();
            iReckon(sir, argInfos[0].name).isGonnaBe(TEST_PARAM_INFO_BOOLEAN_SINGLE.name);
            iReckon(sir, argInfos[0].isBare).asTo('0 isBare').isGonnaBeFalsy();
            iReckon(sir, argInfos[0].value).isGonnaBe(true);

            iReckon(sir, argInfos[1]).isGonnaBeTruthy();
            iReckon(sir, argInfos[1].name).isGonnaBe(PARAM_INFO_BARE.name);
            iReckon(sir, argInfos[1].isBare).isGonnaBeTrue();
            iReckon(sir, argInfos[1].value).isGonnaBe(bareArgValue);

            iReckon(sir, argInfos[2]).isGonnaBeTruthy();
            iReckon(sir, argInfos[2].name).isGonnaBe(otherParam.name);
            iReckon(sir, argInfos[2].isBare).isGonnaBeFalsy();
        });

        await ifWe(sir, `have a bare arg inside double quotes`, () => {
            const bareArgValue = 'bare arg here';
            const bareArgValue_InDoubleQuotes = `"${bareArgValue}"`;

            /**
             * not really an important param, just to have some other param in the
             * list for testing with bare args
             */
            const otherParam = clone(TEST_PARAM_INFO_STRING_SINGLE);
            const otherArgValue = '"some value here"';

            const argInfos = buildArgInfos({
                args: [
                    TEST_PARAM_INFO_BOOLEAN_SINGLE.name, // first positional arg can't be just quoted bare, doesn't count as the bare arg
                    bareArgValue_InDoubleQuotes,
                    `--${otherParam.name}=${otherArgValue}`
                ],
                paramInfos: [TEST_PARAM_INFO_BOOLEAN_SINGLE, TEST_PARAM_INFO_STRING_SINGLE],
                bareArgParamInfo: TEST_PARAM_INFO_STRING_WITH_SPACES, // doesn't have to be in paramInfos if passed in here
            });
            iReckon(sir, argInfos.length).asTo("argInfos.length").isGonnaBe(3);

            iReckon(sir, argInfos[0]).isGonnaBeTruthy();
            iReckon(sir, argInfos[0].name).isGonnaBe(TEST_PARAM_INFO_BOOLEAN_SINGLE.name);
            iReckon(sir, argInfos[0].isBare).asTo('0 isBare').isGonnaBeFalsy();
            iReckon(sir, argInfos[0].value).isGonnaBe(true);

            iReckon(sir, argInfos[1]).isGonnaBeTruthy();
            iReckon(sir, argInfos[1].name).isGonnaBe(TEST_PARAM_INFO_STRING_WITH_SPACES.name);
            iReckon(sir, argInfos[1].isBare).isGonnaBeTrue();
            iReckon(sir, argInfos[1].value).isGonnaBe(bareArgValue);

            iReckon(sir, argInfos[2]).isGonnaBeTruthy();
            iReckon(sir, argInfos[2].name).isGonnaBe(otherParam.name);
            iReckon(sir, argInfos[2].isBare).isGonnaBeFalsy();
        });

        await ifWe(sir, `have a bare arg inside single quotes`, () => {
            const bareArgValue = 'bare arg here';
            const bareArgValue_InSingleQuotes = `'${bareArgValue}'`;

            /**
             * not really an important param, just to have some other param in the
             * list for testing with bare args
             */
            const otherParam = clone(TEST_PARAM_INFO_STRING_SINGLE);
            const otherArgValue = '"some value here"';

            const argInfos = buildArgInfos({
                args: [
                    TEST_PARAM_INFO_BOOLEAN_SINGLE.name, // first positional arg can't be just quoted bare, doesn't count as the bare arg
                    bareArgValue_InSingleQuotes,
                    `--${otherParam.name}=${otherArgValue}`
                ],
                paramInfos: [TEST_PARAM_INFO_BOOLEAN_SINGLE, TEST_PARAM_INFO_STRING_SINGLE],
                bareArgParamInfo: TEST_PARAM_INFO_STRING_WITH_SPACES, // doesn't have to be in paramInfos if passed in here
            });
            iReckon(sir, argInfos.length).asTo("argInfos.length").isGonnaBe(3);

            iReckon(sir, argInfos[0]).isGonnaBeTruthy();
            iReckon(sir, argInfos[0].name).isGonnaBe(TEST_PARAM_INFO_BOOLEAN_SINGLE.name);
            iReckon(sir, argInfos[0].isBare).asTo('0 isBare').isGonnaBeFalsy();
            iReckon(sir, argInfos[0].value).isGonnaBe(true);

            iReckon(sir, argInfos[1]).isGonnaBeTruthy();
            iReckon(sir, argInfos[1].name).isGonnaBe(TEST_PARAM_INFO_STRING_WITH_SPACES.name);
            iReckon(sir, argInfos[1].isBare).isGonnaBeTrue();
            iReckon(sir, argInfos[1].value).isGonnaBe(bareArgValue);

            iReckon(sir, argInfos[2]).isGonnaBeTruthy();
            iReckon(sir, argInfos[2].name).isGonnaBe(otherParam.name);
            iReckon(sir, argInfos[2].isBare).isGonnaBeFalsy();
        });

        await ifWe(sir, `have a bare arg NOT inside double quotes`, () => {
            const bareArgValue = 'bare arg here';
            // const bareArgValue_InDoubleQuotes = `"${bareArgValue}"`;

            /**
             * not really an important param, just to have some other param in the
             * list for testing with bare args
             */
            const otherParam = clone(TEST_PARAM_INFO_STRING_SINGLE);
            const otherArgValue = '"some value here"';

            const argInfos = buildArgInfos({
                args: [
                    TEST_PARAM_INFO_BOOLEAN_SINGLE.name, // first positional arg can't be just quoted bare, doesn't count as the bare arg
                    bareArgValue,
                    `--${otherParam.name}=${otherArgValue}`
                ],
                paramInfos: [TEST_PARAM_INFO_BOOLEAN_SINGLE, TEST_PARAM_INFO_STRING_SINGLE],
                bareArgParamInfo: TEST_PARAM_INFO_STRING_WITH_SPACES, // doesn't have to be in paramInfos if passed in here
            });
            iReckon(sir, argInfos.length).asTo("argInfos.length").isGonnaBe(3);

            iReckon(sir, argInfos[0]).isGonnaBeTruthy();
            iReckon(sir, argInfos[0].name).isGonnaBe(TEST_PARAM_INFO_BOOLEAN_SINGLE.name);
            iReckon(sir, argInfos[0].isBare).asTo('0 isBare').isGonnaBeFalsy();
            iReckon(sir, argInfos[0].value).isGonnaBe(true);

            iReckon(sir, argInfos[1]).isGonnaBeTruthy();
            iReckon(sir, argInfos[1].name).isGonnaBe(TEST_PARAM_INFO_STRING_WITH_SPACES.name);
            iReckon(sir, argInfos[1].isBare).isGonnaBeTrue();
            iReckon(sir, argInfos[1].value).isGonnaBe(bareArgValue);

            iReckon(sir, argInfos[2]).isGonnaBeTruthy();
            iReckon(sir, argInfos[2].name).isGonnaBe(otherParam.name);
            iReckon(sir, argInfos[2].isBare).isGonnaBeFalsy();
        });

    });

});
