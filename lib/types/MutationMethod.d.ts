export declare enum MutationMethod {
    FLIP = 0,
    SWAP = 1
}
export declare type CustomMutationMethod<T> = (chromo: T[]) => T[];
