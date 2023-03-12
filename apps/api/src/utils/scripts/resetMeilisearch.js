async function resetMeilisearch(meilisearchClient) {
    const rawIndexes = [];
    let pageIndex = 0;

    do {
        const limit = 30;
        const offset = pageIndex * limit;

        const page = await meilisearchClient.getRawIndexes({ limit, offset });       
        if(page.results.length <= 0) break;

        rawIndexes.push(...page.results);
        pageIndex++;
    } while(true);

    console.log(`Deleting ${rawIndexes.length} indexes`);
    for(const rawIndex of rawIndexes) {
        if(typeof meilisearchClient.buildRawIndex !== "function") {
            await meilisearchClient.index(rawIndex.uid).delete().then(() => {
                console.log(`Deleted index '${rawIndex.uid}'`);
            }).catch((error) => {
                console.log(`Failed deleting index '${rawIndex.uid}': ${error.message}`, error);
            });
        } else {
            const index = await meilisearchClient.buildRawIndex(rawIndex);
            await index.delete().then(() => {
                console.log(`Deleted index '${rawIndex.uid}'`);
            }).catch((error) => {
                console.log(`Failed deleting index '${rawIndex.uid}': ${error.message}`, error);
            });
        }
    }
}

module.exports = {
    resetMeilisearch: resetMeilisearch
}
