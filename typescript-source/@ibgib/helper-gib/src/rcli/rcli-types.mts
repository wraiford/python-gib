
/**
 * Description of a parameter in an RCLI (Request Line Interface) context.
 *
 * i think i have this ArgInfo already implemented elsewhere, and plugged up
 * with lex-gib helper, but i'm on a time crunch here. (Possibly thinking of
 * how I interpret robbot commands?)
 */
export interface RCLIParamInfo {
    /**
     * default name of the param. RCLI will accept this in form of `--[name]="value"`.
     * If it's a flag param, then this may just be `--[name]`
     *
     * @example for a param with name "output-path"
     *
     *     my-cmd --output-path="."
     */
    name: string;
    /**
     * optional description of the param.
     */
    description?: string;
    /**
     * @exampe 'h' could be a synonym for 'help'
     */
    synonyms?: string[];
    // synonyms: string[]; // todo
    /**
     * If true, this param may not include a value, i.e., doesn't have `="somevalue"`.
     *
     * @example my-cmd --some-flag --non-flag="i am not a flag as i have an equals value"
     */
    isFlag?: boolean;
    /**
     * If true, then there could be multiple params in single RCLI request.
     *
     * @example ibgib --input="./file1.txt" --input="./file2.txt"
     */
    allowMultiple?: boolean;
    /**
     * The name of the interpretation of the arg (value).
     */
    argTypeName: RCLIArgTypeName;
}

/**
 * Type that the RCLI (Request Line Interface) arg should resolve to.
 *
 * @see {@link RCLIArgTypeName}
 */
export type RCLIArgType = string | number | boolean;

/**
 * String name of {@link RCLIArgType} that the RCLI (Request Line Interface) arg should resolve to.
 *
 * This is used for runtime metadata and must correspond to
 */
export type RCLIArgTypeName = 'string' | 'integer' | 'boolean';

/**
 * Instance of a parameter in an RCLI (Request Line Interface) context.
 */
export interface RCLIArgInfo<T extends RCLIArgType = string> extends RCLIParamInfo {
    value?: T;
    /**
     * the identifier actually used in the command.
     *
     * this could be the `paramInfo.name` or one of the `paramInfo.synonyms`.
     */
    identifier?: string;

    /**
     * If true, this arg was entered without the initial "--" that prefixes all
     * args.
     *
     * For example, if the user types in `ibgib . --init`, then the `.` is the
     * bare arg.
     */
    isBare?: boolean;
}

/**
 * intrinsic structure and information of a raw arg passed in to the rcli.
 *
 * intrinsic, in that this does not have information pertaining to other args in
 * an arg array.
 */
export interface RawArgInfo {
    /**
     * this prefix is by definition any non-word characters at the start of the
     * raw arg.
     *
     * so if the arg starts with "--", "-", ":", etc., then that value will be
     * here.
     */
    prefix?: string;
    /**
     * should be truthy if not bare.
     */
    identifier?: string;
    /**
     * if the arg is in form of identifier=value (or id="value", id='value')
     *
     * note that the arg may still be a flag with only an implied name=true
     * form.  only the caller knows how to interpret if the arg is bare.
     */
    isNameValuePair: boolean;
    /**
     * if {@link isNameValuePair}, this is info on the value
     */
    valueInfo?: {
        /**
         * true if the value is wrapped in single quotes
         */
        singleQuoted: boolean;
        /**
         * true if the value is wrapped in double quotes
         */
        doubleQuoted: boolean;
        /**
         * the full arg or the full value in a name=value pair, with full meaning
         * including surrounding quotes if they exist.
         *
         * in the future, this will also be non-escaped characters.
         */
        rawValueString: string | undefined;
        /**
         * the same as {@link rawValueString} except has surrounding quotes (if they exist) stripped.
         *
         * in the future this will also resolve escaped characters in the value.
         */
        resolvedValueString: string;
    }
}
