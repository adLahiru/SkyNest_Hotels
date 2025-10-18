declare module 'uuid' {
  export function v1(options?: { node?: number[]; clockseq?: number; msecs?: number; nsecs?: number; }): string;
  export function v3(name: string | Buffer, namespace: string | Buffer): string;
  export function v4(options?: { random?: number[]; rng?: () => number[]; }): string;
  export function v5(name: string | Buffer, namespace: string | Buffer): string;
  export function v6(options?: { node?: number[]; clockseq?: number; msecs?: number; nsecs?: number; }): string;
  export function v7(options?: { msecs?: number; }): string;
  
  export function parse(uuid: string): Buffer;
  export function stringify(buffer: Buffer, offset?: number): string;
  export function validate(uuid: string): boolean;
  export function version(uuid: string): number;
  
  export const NIL: string;
}
