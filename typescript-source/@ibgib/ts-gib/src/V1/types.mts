/**
 * The core of the simplicity of the ibGib protocol is that you are
 * taking two (or more) ibGibs and producing other ibGibs.
 *
 * There are three primary functions: mut8, rel8, fork
 *
 * These are actually different aspects of the single function of
 * relationship and time, either:
 *   1) Creating a 'new' timeline, or...
 *   2) Extending an existing one.
 *
 * Mut8 is intrinsic, rel8 is extrinsic, fork is a new timeline.
 * Mut8 changes a timeline, rel8 changes a timeline's link(s),
 * fork creates a new timeline.
 */
import {
    IbGibRel8ns, IbGibAddr, IbGibWithDataAndRel8ns, Gib,
} from '../types.mjs';

/**
 * Need to see if I can remove this...
 */
export declare type IbGibData_V1 = {
    [key: string]: any;
    /**
     * if true, this is the very first ibgib in a timeline.
     *
     * in the future, it is possible that there will be multiple temporal
     * junction points and that this may be true for multiple ibgibs in a
     * timeline. but atow (02/2024) and the foreseeable future, this should only
     * be true for the very first ibgib.
     *
     */
    isTjp?: boolean;
    /**
     * special property meant to track evolution count. So when a transform is
     * applied to a punctiliar ibgib, this value is incremented if that ibgib
     * has a temporal junction point (tjp).
     */
    n?: number;
    /**
     * the timestamp that the ibgib was created/evolved.  to get the
     * milliseconds, get/set {@link timestampMs}
     */
    timestamp?: string;
    /**
     * the ms component of {@link timestamp}
     */
    timestampMs?: number;
    /**
     * if given, this is the unique identification for the ibgib. note that
     * there is often a good use case for this when linking multiple ibgibs
     * together in some operation. but usually this is a convenience property.
     * most actual identification should often be done with the ib^gib address,
     * either the tjp or punctiliar address depending on use case.
     */
    uuid?: string;
};

/**
 * Convenience enum to avoid spelling mistakes. (optional)
 */
export enum Rel8n {
    past = 'past',
    ancestor = 'ancestor',
    dna = 'dna',
    identity = 'identity',
    tjp = 'tjp',
    secret = 'secret',
    encryption = 'encryption',
}
/**
 * shape of named edges (hard links) to other ibgibs which forms a dependency
 * graph (DAG) in V1.
 *
 * Note that all rel8ns are open-ended, because this is how rel8ns actually
 * exist. For example, consider that any relationship conceived nowadays in CS
 * as one-to-one, actually can be thought of as many-to-many when considering
 * multiple timelines.
 */
export interface IbGibRel8ns_V1 extends IbGibRel8ns {
    /**
     * when an ibgib is evolved, this is a rel8n to pointer(s) in the ibgib
     * timeline's history.
     *
     * depending on use case, this could only be a single pointer to the most
     * recent past (like a linked list or blockchain), or it could be the entire
     * history from inception of the ibgib.
     * @optional
     */
    [Rel8n.past]?: IbGibAddr[];
    /**
     * associate the owner/producer of the ibgib. not in use atow (02/2024), so
     * this may change or be yagni. the keystone structure will solve this.
     * @optional
     */
    [Rel8n.identity]?: IbGibAddr[];
    /**
     * when an ibgib is forked, this is the parent.
     * @optional
     */
    [Rel8n.ancestor]?: IbGibAddr[];
    /**
     * points to the dna that are the history of applied transforms that got the
     * ibgib to its current state.
     * @optional
     */
    [Rel8n.dna]?: IbGibAddr[];
    /**
     * temporal junction point of the ibgib.
     *
     * this is set if either uuid or timestamp tjp setting is used when the most
     * recent transform was applied.
     * @optional
     */
    [Rel8n.tjp]?: IbGibAddr[];
    /**
     * if there is any encryption related to this ibgib, most likely for
     * enciphering one or more properties in the ibgib's `ib` and/or `data`
     * properties, the associated secret(s) can be linked here.
     * @optional
     */
    [Rel8n.secret]?: IbGibAddr[];
    /**
     * if there is any encryption related to this ibgib, most likely for
     * enciphering one or more properties in the ibgib's `ib` and/or `data`
     * properties, the encryption ibgibs (which hold encryption details like
     * encryption algorithm + parameterization) can be linked here.
     * @optional
     */
    [Rel8n.encryption]?: IbGibAddr[];
}
/**
 * combined shape of the overall v1 ibgib. it has an ib, gib, data, and rel8ns.  */
export interface IbGib_V1<TData = IbGibData_V1, TRel8ns extends IbGibRel8ns_V1 = IbGibRel8ns_V1>
    extends IbGibWithDataAndRel8ns<TData, TRel8ns> {
}

export interface GibInfo {
    /**
     * Hash for this ibgib frame in time.
     */
    punctiliarHash?: string;
    /**
     * The gib for this ibgib's most recent tjp.
     *
     * ## notes
     *
     * ATOW, only one tjp expected really, though I've been coding
     * with the possibility of having multiple tjp's similar to
     * checkpoints.
     */
    tjpGib?: Gib;
    /**
     * If
     */
    piecesCount?: number;
    /**
     * If a delimiter is used in this gib, this is the delimiter.
     *
     * ## notes
     *
     * ATOW, the caller already knows the delimiter. But I'm thinking that
     * I may be persisting this at some point and it would be good to include.
     */
    delimiter?: string;
    /**
     * True the gib is just 'gib' (GIB constant), else falsy.
     */
    isPrimitive?: boolean;
}
