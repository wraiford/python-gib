import { readdir, open } from 'node:fs/promises';
import { statSync } from 'node:fs';
import * as pathUtils from 'path';

import { HELPER_LOG_A_LOT } from "../constants.mjs";

/**
 * This is how I enable/disable verbose logging. Do with it what you will.
 */
const logalot = HELPER_LOG_A_LOT || false;

export function labelize(value: any): string {
    let resLabel: string;
    if (value === undefined) {
        resLabel = 'undefined';
    } else if (value === null) {
        resLabel = 'null';
    } else {
        let raw: string = value.toString();

        const max = 512;
        if (raw.length > max) {
            resLabel = raw.substring(0, max) + '...';
        } else {
            resLabel = raw;
        }
    }
    return resLabel;
}

/**
 * Searches through the file (without importing it) for extra respecful
 * functions.
 *
 * @param respecPath
 * @returns true if extra respecful functions found in file
 */
export async function respecFileHasExtraRespec(respecPath: string, extraRespecFunctionNames: string[]): Promise<boolean> {
    const lc = `[${respecFileHasExtraRespec.name}]`;
    try {
        if (logalot) { console.log(`${lc} starting... (I: 61f3221917ba77175efa305b14defc23)`); }
        extraRespecFunctionNames ??= [];
        const file = await open(respecPath);
        for await (const line of file.readLines()) {
            const hasExtraRespecfulFuncWithOpenParen =
                extraRespecFunctionNames.some(fnName => {
                    if (line.includes(`${fnName}(`)) { return true; }
                });
            const hasExtraRespecfulOptionSetToTrue =
                line.includes("extraRespecful: true");
            const hasExtraRespecInLine =
                hasExtraRespecfulFuncWithOpenParen || hasExtraRespecfulOptionSetToTrue;
            if (hasExtraRespecInLine) { return true; }
        }
        return false;
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}
