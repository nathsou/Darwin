
export enum MutationMethod {
    FLIP,
    SWAP
}

export type CustomMutationMethod<T> = (chromo: T[]) => T[];