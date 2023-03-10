
/**
 * Prepare the object for transfer to meilisearch.
 * This will parse nested objects and will only include annotated properties
 * @param document 
 * @returns Modified and filtered object
 */
export function filterDocument<T = any>(obj: T | Partial<T>, includedProps: string[]): T {
    const result = filterObjectByKeys(obj, includedProps);
    console.log(result);
    return result;
}

function filterObjectByKeys(obj: any, keys: string[]): any {
    const filteredObj: any = {};

    Object.keys(obj).forEach(key => {
        if (keys.includes(key)) {
            filteredObj[key] = obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (Array.isArray(obj[key])) {
                const nestedArray = obj[key].map((item: any) => filterObjectByKeys(item, keys.map(k => k.replace(`${key}[].`, ''))));
                if (nestedArray.length) {
                    filteredObj[key] = nestedArray;
                }
            } else {
                const nestedObj = filterObjectByKeys(obj[key], keys.map(k => k.replace(`${key}.`, '')));
                if (Object.keys(nestedObj).length) {
                    filteredObj[key] = nestedObj;
                }
            }
        }
    });

    return filteredObj;
  }