/** Structural adapter API inherited from shop-a; no react-admin renderer is bundled. */
export type Identifier=string|number;
export type RaRecord={id:Identifier;[key:string]:any};
export type DataProvider={ [key in 'getList'|'getOne'|'getMany'|'getManyReference'|'create'|'update'|'updateMany'|'delete'|'deleteMany']:(...args:any[])=>Promise<any> };
