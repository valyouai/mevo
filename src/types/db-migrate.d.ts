declare module 'db-migrate' {
  interface DBMigrate {
    up: () => Promise<void>;
  }

  interface DBMigrateAPI {
    getInstance(isModule: boolean, options: any): DBMigrate;
  }

  const dbmigrate: DBMigrateAPI;
  export = dbmigrate;
}
