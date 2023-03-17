async function resetDatabase(datasource) {
    return datasource.query("SHOW TABLES WHERE Tables_in_soundcore NOT LIKE '%zone%' AND Tables_in_soundcore NOT LIKE '%mount%';").then(async (result) => {
        const tables = result.map((entry) => Object.values(entry)[0]);

        if(tables.length <= 0) {
            console.log("No tables deleted");
            return;
        }

        console.log(`Dropping ${tables.length} tables...`);

        const sql = "DROP TABLE " + tables.join(", ") + ";";
        await datasource.query("SET foreign_key_checks = 0;");
        await datasource.query(sql);
        await datasource.query("SET foreign_key_checks = 1;");
    });
}

module.exports = {
    resetDatabase: resetDatabase
}