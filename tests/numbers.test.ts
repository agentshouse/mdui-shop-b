import{it,expect}from'vitest';import{parseBusinessNumber}from'../src/numbers';
it.each(['','-','+','1.','.','1e','-0.'])('keeps incomplete numeric field %j as typed',v=>expect(parseBusinessNumber(v)).toBe(v));
it.each([['0',0],['22',22],['3.5',3.5],['-1',-1]])('parses completed numeric %s without allowing negative values past schema validation',(v,w)=>expect(parseBusinessNumber(String(v))).toBe(w));
