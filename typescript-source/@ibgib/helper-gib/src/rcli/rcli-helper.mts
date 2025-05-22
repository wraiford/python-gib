/**
 * @module rcli-helper functions
 *
 * utilities to help enable rcli functionality, yeah, that's the ticket...
 */

import { clone, extractErrorMsg, pretty } from '../helpers/utils-helper.mjs';
import { RCLIArgInfo, RCLIArgType, RCLIParamInfo, RawArgInfo, } from "./rcli-types.mjs";
import { HELPER_LOG_A_LOT } from '../constants.mjs';
import { PARAM_INFO_BARE } from "./rcli-constants.mjs";


/**
 * used in verbose logging
 */
const logalot = HELPER_LOG_A_LOT || false;

/**
 * All incoming arg values are strings. This will convert that depending on the
 * parameter definition.
 *
 * ...hmm, unsure how to handle undefined just yet, even though that is a return type here...
 *
 * @returns casted/parsed value as a string/number/boolean value.
 */
export function getValueFromRawString<T extends RCLIArgType = string>({
    paramInfo,
    valueString,
}: {
    paramInfo: RCLIParamInfo;
    valueString: string | undefined;
}): T | undefined {
    const lc = `[${getValueFromRawString.name}]`;
    try {
        switch (paramInfo.argTypeName) {
            case 'string':
                // no conversion required, but we need to strip the double-quotes if exist.
                let castedValue = valueString as string;
                if (
                    (castedValue.startsWith(`"`) && castedValue.endsWith(`"`)) ||
                    (castedValue.startsWith(`'`) && castedValue.endsWith(`'`))
                ) {
                    castedValue = castedValue.slice(1);
                    castedValue = castedValue.slice(0, castedValue.length - 1);
                }
                return castedValue as T;
            case 'integer':
                // convert to a number
                if (valueString === undefined) { throw new Error(`integer arg value is undefined. integers must be a valid integer string (E: ce17acde3b863ec5e2fdcc594f0f1423)`); }
                const argValueInt = Number.parseInt(valueString);
                if (typeof argValueInt !== 'number') { throw new Error(`arg value string (${valueString})did not parse to an integer. parse result: ${argValueInt} (E: 43cde93160458610ffb49fd16a02d123)`); }
                return argValueInt as T;
            case 'boolean':
                // convert to a boolean
                if (valueString === undefined || valueString === '') {
                    if (!paramInfo.isFlag) { throw new Error(`valueString is undefined or empty string but paramInfo.argTypeName === 'boolean' and paramInfo.isFlag is falsy. (E: 482e595c0ec7344b04def76c1441d623)`); }
                    // value is not provided, so the arg string is empty. the param is
                    // a flag, so just its presence means the value is "true".
                    return true as T;
                } else if (valueString === null) {
                    // ? is this even possible to get here?
                    throw new Error(`(UNEXPECTED) valueString === null? (E: 78f548b93026407968356d9c4f106223)`);
                } else {
                    // typos will evaluate
                    if (!['true', 'false'].includes(valueString)) {
                        throw new Error(`invalid boolean valueString ("${valueString}"). must be either "true" or "false" (E: ba7a0d0804131acc2bd9ab37c0382523)`);
                    }
                    return (valueString === 'true') as T;
                }
            default:
                throw new Error(`(UNEXPECTED) invalid paramInfo.argTypeName (E: c8b03ccb71394d22a29858b98753a123)`);
        }
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }
}

/**
 * extracts the arg value(s) from the corresponding `paramInfo` from the given
 * `argInfos`.
 *
 * @returns the arg.value corresponding to the given `paramInfo`
 */
export function extractArgValue<T extends RCLIArgType>({
    paramInfo,
    argInfos,
    throwIfNotFound,
}: {
    /**
     * Param you're pulling from the args.
     */
    paramInfo: RCLIParamInfo,
    /**
     * the given arg infos from the request line.
     */
    argInfos: RCLIArgInfo<RCLIArgType>[],
    /**
     * If true, will throw an exception if the param is not found in the args,
     * else just returns undefined.
     */
    throwIfNotFound?: boolean,
}): T | T[] | undefined {
    const lc = `[${extractArgValue.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: d376123d1e383f6323ef1fc6bb68f123)`); }

        const filteredArgInfos = argInfos.filter(x => x.name === paramInfo.name || (x.synonyms ?? []).some(syn => (paramInfo.synonyms ?? []).includes(syn)));

        if (logalot) { console.log(`${lc} filteredArgInfos: ${pretty(filteredArgInfos)} (I: a15831a9bf2930435960263c79d34323)`); }
        if (filteredArgInfos.length === 0) {
            if (throwIfNotFound) {
                throw new Error(`param (name: ${paramInfo.name}) not found among args. (E: a74e41ca7de883f26f216a8d15ab7a23)`);
            } else {
                return undefined;
            }
        }

        if (paramInfo.allowMultiple) {
            // allow multiple args, so return type is T[]
            if (paramInfo.isFlag) { throw new Error(`(UNEXPECTED) param (name: ${paramInfo.name}) is defined as allowMultiple and isFlag, which doesn't make sense. (E: 2854512470b2dde4b9a82fe225d22623)`); }
            if (paramInfo.argTypeName === 'boolean') { throw new Error(`(UNEXPECTED) param (name: ${paramInfo.name}) is defined as allowMultiple and its type name is boolean, which doesn't make sense. (E: 259d77da25374726af4895eb19bb3041)`); }

            if (filteredArgInfos.some(arg => arg.value !== 0 && !arg.value)) {
                throw new Error(`param (name: ${paramInfo.name}) value is not 0 but is falsy. (E: e5af23465f6920a2ff6be7b7d49ef123)`);
            }
            return filteredArgInfos.map(arg => arg.value as T);

        } else {
            // allow only single arg, so return type is T
            if (filteredArgInfos.length > 1) { throw new Error(`param (name: ${paramInfo.name}) had multiple args but param.allowMultiple is falsy. (E: 0d01157e773bd34f962f8713e7719c23)`); }

            const argInfo = filteredArgInfos[0] as RCLIArgInfo<T>;

            // if the flag is set but no `="true"` or `="false"` provided, then
            // we set the value to true
            if (paramInfo.isFlag && argInfo.value === undefined) {
                if (paramInfo.argTypeName !== 'boolean') {
                    throw new Error(`(UNEXPECTED) paramInfo.isFlag is true but argTypeName !== 'boolean' (E: 79a86d0c6ef4c7740aa84211ebadbb23)`);
                }
                argInfo.value = true as T;
            }

            if (logalot) { console.log(`argInfo.value: ${argInfo.value}`) }

            return argInfo.value;
        }
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * gets the paramInfo corresponding to the given argIdentifier
 * @returns paramInfo from given `paramInfos` or undefined if not found
 */
export function getParamInfo({
    argIdentifier,
    paramInfos,
    throwIfNotFound,
}: {
    /**
     * arg identifier is either a name or a synonym. atow only a name.
     */
    argIdentifier: string;
    /**
     * All possible param infos that the given arg identifier could be.
     */
    paramInfos: RCLIParamInfo[];
    throwIfNotFound?: boolean;
}): RCLIParamInfo | undefined {
    const lc = `[${getParamInfo.name}]`;
    try {
        const filteredParamInfos = paramInfos.filter(p => p.name === argIdentifier || (p.synonyms ?? []).includes(argIdentifier));

        if (filteredParamInfos.length === 1) {
            return clone(filteredParamInfos[0]);
        } else if (filteredParamInfos.length > 1) {
            throw new Error(`(UNEXPECTED) multiple param infos found with argIdentifier. do you have overlapping arg names/synonyms? (${argIdentifier} found in (${filteredParamInfos.length} param infos)) (E: d599a6647c5ead6d9fbac4e4c96e6d23)`);
        } else {
            if (throwIfNotFound) {
                throw new Error(`(UNEXPECTED) param info not found for argIdentifier (${argIdentifier}) (E: 47e704068f2eb5a0551cf45d0e72c823)`);
            } else {
                return undefined;
            }
        }
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    }
}

/**
 * helper that parses a raw arg e.g. 'bare-arg', '--double-dashed-arg',
 * '-single-dashed-arg', ':command-arg', etc.
 */
export function parseRawArg({
    rawArg,
}: {
    rawArg: string,
}): RawArgInfo {
    const lc = `[${parseRawArg.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 5d51b75b7a025e2e3fa498da7c08ac24)`); }

        const fnGetQuoteType: (s: string) => "single" | 'double' | undefined = (s) => {
            if (s.startsWith('"') && s.endsWith('"')) {
                return 'double';
            } else if (s.startsWith("'") && s.endsWith("'")) {
                return "single";
            } else {
                return undefined;
            }
        }

        const fnStripQuotes: (s: string) => string = (s) => {
            if (fnGetQuoteType(s)) {
                return s.slice(0, s.length - 1).slice(1);
            } else {
                return s;
            }
        }

        /**
         * if falsy, a name=value form may still have value quoted
         */
        const rawArgQuoteMaybe = fnGetQuoteType(rawArg);

        if (rawArgQuoteMaybe) {
            // entire raw arg is bare and surrounded by quotes
            return {
                prefix: undefined,
                identifier: undefined,
                isNameValuePair: false,
                valueInfo: {
                    rawValueString: rawArg.concat(),
                    resolvedValueString: fnStripQuotes(rawArg),
                    singleQuoted: rawArgQuoteMaybe === 'single',
                    doubleQuoted: rawArgQuoteMaybe === 'double',
                },
            }
        } else if (rawArg.match(/^(--\w|-\w|:\w)/)) {
            // not quoted but starts with a prefix (non-word character), so not
            // bare. if it has an equal sign, then is definitely name=value with
            // possible quoted value.
            if (rawArg.includes('=')) {
                // raw arg is --name=value, name=value and value may be quoted
                /**
                 * starts with prefix, then identifier, then equals sign, then possibly quoted value
                 */
                const regexp = /^(--|-|:)([\w\-]+)=(['"]?.+['"]?)$/;
                let regExpMatch = rawArg.match(regexp);
                if (!regExpMatch) { throw new Error(`invalid rawArg (${rawArg}). expected an arg matching regexp ${regexp}. (E: 05ca56163e184faeb66456a0e9190b28)`); }

                const [_entireArg, prefix, identifier, possiblyQuotedValue] = regExpMatch;
                const valueQuoteMaybe = fnGetQuoteType(possiblyQuotedValue);
                return {
                    prefix,
                    identifier,
                    isNameValuePair: true,
                    valueInfo: {
                        rawValueString: possiblyQuotedValue,
                        resolvedValueString: !!valueQuoteMaybe ? fnStripQuotes(possiblyQuotedValue) : possiblyQuotedValue,
                        singleQuoted: valueQuoteMaybe === 'single',
                        doubleQuoted: valueQuoteMaybe === 'double',
                    },
                };
            } else {
                // starts with prefix but no name=value - so is a boolean flag
                const regexp = /^(--|-|:)([\w\-]+)$/;
                let regExpMatch = rawArg.match(regexp);
                if (!regExpMatch) { throw new Error(`invalid rawArg (${rawArg}). expected an arg matching regexp ${regexp}. at this point, it should have a prefix (e.g. "--"), and a single identifier (should be a flag since there is no equal sign). (E: 93305923465d9449bdce3f81373fae24)`); }
                const [_entireArg, prefix, bareArg] = regExpMatch;
                return {
                    prefix,
                    identifier: bareArg,
                    isNameValuePair: false,
                    valueInfo: {
                        rawValueString: undefined,
                        resolvedValueString: 'true',
                        singleQuoted: false,
                        doubleQuoted: false,
                    }
                }
            }
        } else if (rawArg.includes('=')) {
            throw new Error(`invalid rawArg (${rawArg}). isn't quoted, doesn't start with prefix, but it does have an equal sign? that's bad. (E: e8ad15211ce6fd56a4a214c2778c4724)`);
        } else {
            // bare but not quoted. this could be either the identifier/name or
            // the value. only the caller knows how to interpret this.
            return {
                prefix: undefined,
                identifier: undefined,
                isNameValuePair: false,
                valueInfo: {
                    rawValueString: rawArg,
                    resolvedValueString: rawArg,
                    doubleQuoted: false,
                    singleQuoted: false,
                },
            }
        }
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

/**
 * helper that checks a raw arg (including any dashes) against a parameter
 * definition.
 *
 * @returns true if the arg is the given paramInfo, else false
 */
export function argIs({ arg, paramInfo, argInfoIndex, }: {
    /**
     * raw arg string, including dash(es)
     */
    arg: string,
    /**
     * param you're checking against the raw arg value.
     */
    paramInfo: RCLIParamInfo,
    /**
     * positional index in argInfos. used in interpreting bare args.
     *
     * if it's the first arg and bare, then it's a command identifier. If it's a
     * different position and bare, then it's the bare arg value.
     */
    argInfoIndex: number,
}): boolean {
    const rawArgInfo = parseRawArg({ rawArg: arg });
    let identifier: string;
    if (rawArgInfo.prefix) {
        if (!rawArgInfo.identifier) { throw new Error(`rawArgInfo.prefix truthy but rawArgInfo.identifier falsy? (E: b53cf8d2f26b84e3d7f6351d7b2ebc24)`); }
        identifier = rawArgInfo.identifier.toLowerCase();
    } else if (argInfoIndex === 0) {
        // bare arg. if it's position index === 0, then it's a command identifier.
        if (!rawArgInfo.valueInfo?.rawValueString) { throw new Error(`(unexpected) argInfoIndex === 0 and prefix falsy, but !rawArgInfo.valueInfo?.rawValueString? (E: 1c237f304dc54505e94846eeb16e0124)`); }
        identifier = rawArgInfo.valueInfo.rawValueString;
    } else {
        // bare arg but not first position
        identifier = PARAM_INFO_BARE.name;
    }
    const nameMatches = identifier === paramInfo.name.toLowerCase();
    if (nameMatches) {
        // no need to check synonyms
        return true; /* <<<< returns early */
    } else if ((paramInfo.synonyms ?? []).length > 0) {
        // check synonyms
        return paramInfo.synonyms!.some(x => x.toLowerCase() === identifier);
    } else {
        // no synonyms and name didn't match
        return false;
    }
}

/**
 * This takes incoming raw `args` and parameter definitions and
 * creates arginfos based on the given args.
 * @returns argInfos that include values based on given raw args
 */
export function buildArgInfos<T extends RCLIArgType = string>({
    args,
    paramInfos,
    bareArgParamInfo = clone(PARAM_INFO_BARE),
    logalot: localLogalot,
}: {
    /**
     * array of raw args, including dashes
     */
    args: string[],
    /**
     * parameter set of all possible parameters
     */
    paramInfos: RCLIParamInfo[],
    /**
     * provides the param info to use when encountering a "bare arg".
     *
     * there can be one bare arg in the RCLI args list. This is an arg that does
     * not start with the `--` prefix. When a bare arg is received, you must
     * specify which param to map this to, because we don't have a param
     * identifer (param name or synonym).
     */
    bareArgParamInfo?: RCLIParamInfo,
    /**
     * if you want to use verbose logging, set this to true
     */
    logalot?: boolean,
}): RCLIArgInfo<T>[] {
    const lc = `[${buildArgInfos.name}]`;
    try {
        if (logalot || localLogalot) { console.log(`${lc} starting... (I: f389aaa490796dfd823bc7b9d4e58b23)`); }

        /**
         * the first positional arg can be bare and one additional non-positional arg can be bare.
         *
         * if a non-positional bare arg is found and we then find another one, then we gotta throw
         */
        let nonPositionalBareArgFound = false;

        const argInfos = args.map((arg: string, argIndex: number) => {
            let argIdentifier: string;
            let valueString: string;
            let argInfo: RCLIArgInfo<T>;
            const { prefix, identifier, isNameValuePair, valueInfo } = parseRawArg({ rawArg: arg });
            if (prefix) {
                // normal arg prefixed with --, -, :, etc.
                if (logalot || localLogalot) { console.log(`identifier: ${identifier} (I: 519ce129a1e34753a9070d3a205c9a8b)`); }
                if (!identifier) { throw new Error(`(UNEXPECTED) prefix truthy but identifier falsy? (E: f33ab3a2b623acc0d1bc36685edfaf24)`); }

                argIdentifier = identifier;
                if (!valueInfo) { throw new Error(`(UNEXPECTED) !valueInfo? (E: 05249a361a59008cd313d2dfa8f08b24)`); }

                if (isNameValuePair) {
                    if (logalot) { console.log(`${lc} identifier with equals: ${identifier}. (I: 5f8ae91d1ddd4a7f94c0f4fb7e688502)`) }
                    // [argIdentifier, valueString] = identifier.split('=');

                    const paramInfo = getParamInfo({ argIdentifier, paramInfos, throwIfNotFound: true })!;
                    argInfo = {
                        ...paramInfo,
                        value: getValueFromRawString<T>({ paramInfo, valueString: valueInfo.rawValueString }),
                        identifier: argIdentifier,
                    }
                } else {
                    if (logalot) { console.log(`${lc} identifier without equals: ${identifier}`) }
                    argIdentifier = identifier;
                    const paramInfo = getParamInfo({ argIdentifier, paramInfos, throwIfNotFound: true })!;
                    argInfo = {
                        ...paramInfo,
                        value: getValueFromRawString<T>({ paramInfo, valueString: undefined }),
                        identifier: argIdentifier,
                        isFlag: true, // should be the same in paramInfo, but being explicit here
                    }
                }
            } else if (argIndex === 0) {
                // bare arg, but it's in the first position.  the first arg must
                // be a command/flag (or a scope-limiting flag that acts
                // essentially the same as a command) so we interpret this as
                // the identifier.
                if (!valueInfo) { throw new Error(`(UNEXPECTED) argIndex === 0 but valueInfo falsy? (E: 4642b42c855593b7ffdacb85f27dab24)`); }
                if (!valueInfo.rawValueString) { throw new Error(`(UNEXPECTED) !valueInfo.rawValueString? (E: 0b35f71eb8227cdd67ccfc32f2e45824)`); }
                if (valueInfo.singleQuoted) { throw new Error(`first arg is quoted? (single). a bare arg in first position must be a command/flag. (E: 28cce820417fd3b4f95ba6c7e94b4624)`); }
                if (valueInfo.doubleQuoted) { throw new Error(`first arg is quoted? (double). a bare arg in first position must be a command/flag. (E: 0b948c87081043fdb168f08ba05ebbce)`); }
                argIdentifier = valueInfo.rawValueString;
                const paramInfo = getParamInfo({ argIdentifier, paramInfos, throwIfNotFound: true })!;
                argInfo = {
                    ...paramInfo,
                    value: true as any,
                    identifier: argIdentifier,
                    isFlag: true, // should be the same in paramInfo, but being explicit here
                }
            } else {
                // bare arg found and it's not in the first position
                if (logalot || localLogalot) { console.log(`bare arg found. (I: d6f67074c7e44a63864948d4bf04bee8)`); }
                if (!bareArgParamInfo) { throw new Error(`bare arg found (one without prefix like "--" or ":") but there is no param info expected for bare args. You must provide which param info a bare arg maps to in this ${buildArgInfos.name} call. (E: 650dd3695d62f0f87dd0cbafbf068c23)`); }
                if (nonPositionalBareArgFound) { throw new Error(`You can have the first arg - a special arg like a command - be bare (without prefix like "--" or ":") and one additional non-positional arg be bare. But more than one non-positional bare arg found. Also remember if the arg has spaces then you have to enclose it with single or double quotes.  (E: 74dea8f13f0c14e3b7a2f125c7faca23)`); }
                nonPositionalBareArgFound = true;
                const paramInfo = clone(bareArgParamInfo) as RCLIParamInfo;
                argInfo = {
                    ...paramInfo,
                    isBare: true,
                    identifier: paramInfo.name, // not strictly true but the isBare indicates this
                    value: getValueFromRawString<T>({ paramInfo, valueString: arg }),
                };
            }
            if (logalot) { console.log(`${lc} argInfo: ${pretty(argInfo)}`); }
            return argInfo!;
        });
        return argInfos;
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`);
        throw error;
    } finally {
        if (logalot || localLogalot) { console.log(`${lc} complete.`); }
    }
}
