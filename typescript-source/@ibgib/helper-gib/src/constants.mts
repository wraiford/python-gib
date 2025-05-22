
/**
 * @internal
 * Used internally for logging.
 */
export const HELPER_LOG_A_LOT = false;

export const DEFAULT_UUID = undefined;
export const UUID_REGEXP = /^[a-zA-Z0-9_\-.]{1,256}$/;

/**
 * regular expression for a classname.
 *
 * Used in witnesses atm.
 */
export const CLASSNAME_REGEXP = /^[a-zA-Z0-9_]{1,255}$/;

/**
 * capture groups for expected (in various places). will return `null` if
 * does not have an id section like `(E: abcdef32chars)`.
 */
export const ERROR_MSG_WITH_ID_CAPTURE_GROUPS_REGEXP = /^(\[.+\])?\s?(\(UNEXPECTED\)|\(unexpected\))?(.+)(\([EIWeiw]: [a-fA-F\d]{32}\))(\(UNEXPECTED\)|\(unexpected\))?$/;
export const ERROR_MSG_LOCATION_ONLY_REGEXP = /^(\[.+\]).+$/;

/**
 * RegExp for a hexadecimal string of length 32
 */
export const HEXADECIMAL_HASH_STRING_REGEXP_32 = /^[0-9a-fA-F]{32}$/;
/**
 * RegExp for a hexadecimal string of length 64
 */
export const HEXADECIMAL_HASH_STRING_REGEXP_64 = /^[0-9a-fA-F]{64}$/;

/**
 * When you have a comma-delimited list of word characters and maybe some specials.
 *
 * @see {@link COMMA_DELIMITED_SIMPLE_STRINGS_REGEXP_DESCRIPTION}
 */
export const COMMA_DELIMITED_SIMPLE_STRINGS_REGEXP = /^[\w\-]+(,?[\w+\-])*$/;
/**
 * Human-readable description to {@link COMMA_DELIMITED_SIMPLE_STRINGS_REGEXP}
 *
 * It is meant to be used with validation errors helper.
 *
 * **WARNING** obviously this can get out of sync.
 */
export const COMMA_DELIMITED_SIMPLE_STRINGS_REGEXP_DESCRIPTION = 'text must only be comma-delimited, no-spaces simple words like "comment,link,pic,x,under_score,hyphens-ok-too"';

/**
 * When expressing ibgib data paths, this will be used as the delimiter
 * to indicate a sub-object.
 *
 * # notes
 *
 * This should be used with the understanding that having overly-complex data
 * maps is an indication that the ibgib may possibly be better designed as
 * multiple ibgibs linked via their rel8ns.
 *
 * That said, I think it will be common for grouping settings, especially
 * mapping from external sources (API, SDK, etc.).
 */
export const DEFAULT_DATA_PATH_DELIMITER = '/';

/**
 * If a string has only non-alphanumerics, this may be returned when getting a safer substring.
 */
export const ONLY_HAS_NON_ALPHANUMERICS = '_nonalphanumerics_';
