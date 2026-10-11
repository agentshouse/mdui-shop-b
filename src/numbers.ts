/** Store incomplete numeric typing in the actual business field until valid. */
export function parseBusinessNumber(value:string){return /^[+-]?(?:\d+|\d*\.\d+)$/.test(value)&&Number.isFinite(Number(value))?Number(value):value;}
