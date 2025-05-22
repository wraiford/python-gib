import { RCLIArgTypeName, RCLIParamInfo } from "./rcli-types.mjs";

/**
 * The keys of this object are the primary prefixes. The values are the arrays
 * of alternate param prefixes.
 *
 * primary-param-prefix -> alt-param-prefix[]
 *
 * this is for making synonyms in a more normalized way.
 */
export const PARAM_PREFIXES: { [paramName: string]: string[] } = {
    'src': ['source', 'from', 'in', 'input'],
    'dest': ['destination', 'to', 'out', 'output'],
}

/**
 * builds a parameter with prefix synonyms.
 *
 * helper specifically for rcli params with prefixes.
 */
export function getParam_src({
    paramName,
    noBare,
    argTypeName,
    description,
}: {
    paramName: string,
    /**
     * set to true if you don't want a synonym that is just {@link paramName}
     * (without a prefix).
     *
     * For example, i differentiate between PARAM_INFO_NAME and
     * PARAM_INFO_SRC_NAME, so on src_name I don't want the bare "name" because
     * that is in PARAM_INFO_NAME.
     */
    noBare?: boolean
    argTypeName?: RCLIArgTypeName,
    description?: string,
}): RCLIParamInfo {
    const rcliParam: RCLIParamInfo = {
        name: `src-${paramName}`,
        argTypeName: argTypeName ?? 'string',
        synonyms: [...PARAM_PREFIXES['src'].map(x => `${x}-${paramName}`),],
        description,
    }
    if (!noBare) { rcliParam.synonyms!.push(paramName); }
    return rcliParam;
}

/**
 * builds a parameter with prefix synonyms.
 *
 * helper specifically for rcli params with prefixes.
 */
export function getParam_dest({ paramName, argTypeName = 'string', description }: {
    paramName: string,
    argTypeName?: RCLIArgTypeName,
    description?: string,
}): RCLIParamInfo {
    const rcliParam: RCLIParamInfo = {
        name: `dest-${paramName}`,
        argTypeName: argTypeName ?? 'string',
        synonyms: [...PARAM_PREFIXES['dest'].map(x => `${x}-${paramName}`),],
        description,
    }
    return rcliParam;
}

/**
 * special param that is used as the only param allowed that doesn't have a
 * "double-dash-specifier=" form. one "bare" arg is allowed atow. if a bare arg
 * is found, it will be mapped to this param info.
 */
export const PARAM_INFO_BARE: RCLIParamInfo = {
    name: 'bare',
    description: `special param that is used as the only param allowed that doesn't have a "double-dash-specifier=" form. one "bare" arg is allowed atow. if a bare arg is found, it will be mapped to this param info.`,
    synonyms: ['bare-arg', 'bare-param', 'no-name', 'manco', 'arg-with-no-name', 'param-with-no-name'],
    argTypeName: 'string',
};
/**
 * the most essential parameter in existence...we all need it.
 */
export const PARAM_INFO_HELP: RCLIParamInfo = {
    name: 'help',
    description: 'the most essential parameter in existence...we all need it.',
    synonyms: ['h'],
    isFlag: true,
    argTypeName: 'boolean',
};
/**
 * flag for dry-run (not producing output but simulating what WOULD be produced)
 */
export const PARAM_INFO_DRY_RUN: RCLIParamInfo = {
    name: 'dry-run',
    description: 'flag for dry-run (not producing output but simulating what WOULD be produced)',
    synonyms: ['dry'],
    isFlag: true,
    argTypeName: 'boolean',
};
/**
 * path pointing to a data resource (file/folder)
 */
export const PARAM_INFO_DATA_PATH: RCLIParamInfo = {
    name: 'data-path',
    description: 'path pointing to a data resource (file/folder)',
    synonyms: [],
    argTypeName: 'string',
};
/**
 * for referencing/ingesting file(s)/folder(s) in a fs
 */
export const PARAM_INFO_INPUT_PATH: RCLIParamInfo = getParam_src({
    paramName: 'path',
    description: 'for referencing/ingesting file(s)/folder(s) in a fs',
})
/**
 * for generating file(s)/folder(s)
 */
export const PARAM_INFO_OUTPUT_PATH: RCLIParamInfo = getParam_dest({
    paramName: 'path',
    description: 'for indicating where to put generated file(s)/folder(s)',
})
/**
 * catchall data as a string parameter
 */
export const PARAM_INFO_DATA_STRING: RCLIParamInfo = {
    name: 'data-string',
    description: 'catchall data as a string parameter',
    synonyms: ['ds'],
    argTypeName: 'string',
};
/**
 * catchall data as an integer parameter
 */
export const PARAM_INFO_DATA_INTEGER: RCLIParamInfo = {
    name: 'data-integer',
    description: 'catchall data as an integer parameter',
    synonyms: ['integer', 'int', 'data-number', 'number', 'num'],
    argTypeName: 'integer',
};
/**
 * catchall data as a boolean parameter
 */
export const PARAM_INFO_DATA_BOOLEAN: RCLIParamInfo = {
    name: 'data-boolean',
    description: 'catchall data as an integer parameter',
    synonyms: ['boolean', 'bool', 'data-bool'],
    argTypeName: 'integer',
};
/**
 * used for when you have a name of whatever, based on command/context.
 *
 * i'm adding this for `PARAM_INFO_GENERATE_SOURCE_FILE` (downstream in
 * ibgib/rcli app), but should be reusable.
 */
export const PARAM_INFO_NAME: RCLIParamInfo = {
    name: 'name',
    description: 'specify the name of something determined by context of the command.',
    argTypeName: 'string',
    allowMultiple: false,
    synonyms: [],
};

/**
 * Array of common parameters.
 */
export const COMMON_PARAM_INFOS: RCLIParamInfo[] = [
    PARAM_INFO_BARE,
    PARAM_INFO_HELP,
    PARAM_INFO_DRY_RUN,
    PARAM_INFO_DATA_PATH,
    PARAM_INFO_INPUT_PATH,
    PARAM_INFO_OUTPUT_PATH,
    PARAM_INFO_DATA_STRING,
    PARAM_INFO_DATA_INTEGER,
    PARAM_INFO_DATA_BOOLEAN,
    PARAM_INFO_NAME,
];
