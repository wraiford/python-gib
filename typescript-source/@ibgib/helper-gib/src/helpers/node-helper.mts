import { statSync } from 'node:fs';
import { readFile, } from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import * as readlineNonPromise from 'node:readline';
import { stdin, stdout } from 'node:process'; // decide if use this or not
import { HELPER_LOG_A_LOT } from '../constants.mjs';
import { extractErrorMsg } from './utils-helper.mjs';
import { Writable } from 'node:stream';

const logalot = HELPER_LOG_A_LOT || false;

/**
 * @deprecated
 *
 * use {@link tryRead}
 * tries to read a file with the given path.
 *
 * @returns data of given file
 */
export async function tryRead_node({
    relOrAbsPath,
}: {
    /**
     * path to try reading from
     */
    relOrAbsPath: string,
}): Promise<string | undefined> {
    return tryRead({ relOrAbsPath });
}

export async function tryRead({
    relOrAbsPath,
}: {
    /**
     * path to try reading from
     */
    relOrAbsPath: string,
}): Promise<string | undefined> {
    const lc = `[${tryRead.name}]`;
    try {
        const stat = statSync(relOrAbsPath);
        if (!stat.isFile()) { throw new Error(`path provided is not a file. (${relOrAbsPath}) (E: f295b7e925534546819edfef9a750164)`); }
        const resRead = await readFile(relOrAbsPath, { encoding: 'utf8' as BufferEncoding });
        if (logalot) {
            console.log(`${lc} record found. data length: ${resRead?.length ?? 0}. fullPath: ${relOrAbsPath}  (I: aa81b3d01e9542788b07302dd174c03d)`);
        }
        return resRead;
    } catch (error) {
        if (logalot) { console.log(`${lc} path not found (${relOrAbsPath})\nerror:\n${extractErrorMsg(error)} (I: 6658a0b81d3249d2aefc8e3d28efa87b)`); }
        return undefined;
    } finally {
        if (logalot) { console.log(`${lc} complete. (I: 747a187ca6234dd4b2bf9a11a87a0d91)`); }
    }
}

/**
 * Very simple helper function.
 *
 * If wanting to do more analysis, just use `statSync` directly.
 *
 * @returns true if the `relOrAbsPath` is a file, else false.
 */
export function isFile({
    relOrAbsPath,
}: {
    /**
     * path to try reading from
     */
    relOrAbsPath: string,
}): boolean {
    const lc = `[${isFile.name}]`;
    try {
        const stat = statSync(relOrAbsPath);
        return stat.isFile();
    } catch (error) {
        console.error(`${lc} ${extractErrorMsg(error)}`)
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete. (I: 747a187ca6234dd4b2bf9a11a87a0d91)`); }
    }
}

export async function promptForConfirm({
    msg,
    yesLabel,
    noLabel,
}: {
    /**
     * if provided, this is the message displayed when confirming.
     */
    msg?: string,
    yesLabel?: string,
    noLabel?: string,
}): Promise<boolean> {
    const lc = `[${promptForConfirm.name}]`;
    try {
        msg ||= 'confirm?';
        yesLabel ||= '(y)es';
        noLabel ||= '(n)o';
        const rl = readline.createInterface({
            input: stdin,
            output: stdout
        });
        try {
            const fnAnswerMatchesLabel = (answer: string, label: string) => {
                if (answer === label.replace(/[\(\)]/g, '').toLowerCase()) {
                    // matched full label
                    return true; /* <<<< returns early */
                } else {
                    // check for short answers
                    const regexCaptureCharsInsideParens = /\((\w+)\)/;
                    const shortLabel = label.match(regexCaptureCharsInsideParens);
                    if ((shortLabel ?? []).length >= 2) {
                        if (answer === shortLabel![1].toLowerCase()) {
                            // matched short label
                            return true; /* <<<< returns early */
                        }
                    }
                }
                // if got this far, nothing positive matched
                return false;
            };

            // try up to three times. if match found, either way, return early.
            const maxTries = 3;
            for (let i = 0; i < maxTries; i++) {
                let answer = await rl.question(`${msg} [${yesLabel}, ${noLabel}]\n`);
                if (answer) {
                    answer = answer.toLowerCase();
                    const matchesYesLabel = fnAnswerMatchesLabel(answer, yesLabel);
                    if (matchesYesLabel) { return true; /* <<<< returns early */ }
                    const matchesNoLabel = fnAnswerMatchesLabel(answer, noLabel);
                    if (matchesNoLabel) { return false; /* <<<< returns early */ }
                } else {
                    `no answer provided. defaulting to no...`;
                    console.log('huh?');
                }
            }

            // max tries reached
            throw new Error(`could not confirm (E: 239797ed8da600a2531e6be4841d8623)`);
        } catch (error) {
            throw error;
        } finally {
            rl.close();
        }
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

export async function promptForBoolean({
    msg,
    trueLabel,
    trueResponses,
    falseLabel,
    falseResponses,
    defaultNoMatchResult,
    warnOnUseDefault,
}: {
    /**
     * if provided, this is the message displayed when confirming.
     */
    msg: string,
    trueLabel?: string,
    trueResponses?: string[],
    falseLabel?: string,
    falseResponses?: string[],
    defaultNoMatchResult?: boolean,
    warnOnUseDefault?: boolean,
}): Promise<boolean> {
    const lc = `[${promptForBoolean.name}]`;
    try {
        if (!msg) { throw new Error(`msg required (E: ecdd43e761239da9040192f56e109e23)`); }
        trueLabel ||= '(y)es';
        falseLabel ||= '(n)o';
        const rl = readline.createInterface({
            input: stdin,
            output: stdout
        });
        try {
            let answer: string | undefined = undefined;

            do {
                answer = await rl.question(`${msg} [${trueLabel}, ${falseLabel}]\n`);
                if (!answer && defaultNoMatchResult !== undefined) {
                    if (warnOnUseDefault) { console.warn(`${lc} no answer provided. defaulting to ${defaultNoMatchResult}...`); }
                    answer = defaultNoMatchResult ? trueLabel : falseLabel;
                    return defaultNoMatchResult; /* <<<< returns early */
                }

                // true/false responses default to the labels without parens and
                // the first letter of each (really this should be first unique
                // discriminating letter between true/false labels)
                const lowerAndSansParens: (s: string) => string = (s: string) => {
                    return s.toLowerCase().replace(/[\(\)]/g, '');
                };
                trueResponses ??= [
                    lowerAndSansParens(trueLabel),
                    lowerAndSansParens(trueLabel)[0],
                ];
                falseResponses ??= [
                    lowerAndSansParens(falseLabel),
                    lowerAndSansParens(falseLabel)[0],
                ];

                if (trueResponses.includes(answer.toLowerCase())) {
                    return true;
                } else if (falseResponses.includes(answer.toLowerCase())) {
                    return false;
                } else if (defaultNoMatchResult !== undefined) {
                    return defaultNoMatchResult;
                } else {
                    console.log(`huh?`);
                    answer = '';
                }
            } while (!answer);

            throw new Error(`(UNEXPECTED) shouldn't get here. should return early with result (E: dec95d4057b8dbf4e37866374971ea23)`);
        } catch (error) {
            throw error;
        } finally {
            rl.close();
        }
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    } finally {
        if (logalot) { console.log(`${lc} complete.`); }
    }
}

interface Mutable {
    muted: boolean;
}

export async function promptForSecret({
    confirm,
}: {
    confirm: boolean,
}): Promise<string> {
    const lc = `[${promptForSecret.name}]`;
    try {
        const mutableStdout = new Writable({
            write: function (chunk, encoding, callback) {
                if (!(this as any).muted)
                    process.stdout.write(chunk, encoding);
                callback();
            }
        }) as Writable & Mutable;
        mutableStdout.muted = false;

        let rl = readlineNonPromise.createInterface({
            input: process.stdin,
            output: mutableStdout,
            terminal: true,
        });

        const fnPrompt = (msg: string) => {
            return new Promise<string>((resolve) => {
                rl.question(msg, function (password) {
                    mutableStdout.muted = false;
                    rl.write('\n')
                    resolve(password);
                });
                mutableStdout.muted = true;
            });
        }
        let secret: string | undefined = undefined;
        try {
            do {
                const secret1 =
                    await fnPrompt(`enter your secret:\n`);
                if (!secret1) {
                    `no secret provided. please try again.`;
                    continue;
                }
                if (confirm) {
                    const secret2 = await fnPrompt(`confirm:\n`);
                    if (secret2 === secret1) {
                        secret = secret1;
                    } else {
                        console.log(`secrets do not match. please try again.`);
                    }
                } else {
                    secret = secret1;
                    continue;
                }
            } while (!secret);
            return secret;
        } catch (error) {
            throw error;
        } finally {
            rl.close();
        }
    } catch (error) {
        console.error(`${lc} ${error.message}`);
        throw error;
    }
}

/**
 * @deprecated
 *
 * use {@link promptForSecret}
 */
export async function promptForSecret_node({
    confirm,
}: {
    confirm: boolean,
}): Promise<string> {
    return promptForSecret({ confirm });
}
