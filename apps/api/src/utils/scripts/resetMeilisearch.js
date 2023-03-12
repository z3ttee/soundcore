export async function resetMeilisearch(meilisearchClient) {
    const indexes = [];
    let pageIndex = 0;

    do {
        const limit = 30;
        const offset = pageIndex * limit;

        const page = await meilisearchClient.getIndexes({ limit, offset });
        if(page.results.length <= 0) break;

        indexes.push(...page.results);
        pageIndex++;
    } while(true);

    console.log(`Deleting ${indexes.length} indexes`);

    for(const index of indexes) {
        await index.delete().then(() => {
            console.log(`Deleted index '${index.uid}'`);
        }).catch((error) => {
            console.log(`Failed deleting index '${index.uid}': ${error.message}`, error);
        });
    }
}

module.exports = {
    resetMeilisearch: resetMeilisearch
}
