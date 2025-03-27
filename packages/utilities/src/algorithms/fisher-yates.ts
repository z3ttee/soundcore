/**
 * Shuffle an array using the Fisher-Yates algorithm. This will copy the existing array
 * and replaces all items to random positions. The result array is returned as value
 * @param arr Input array
 * @returns Shuffled array
 */
export function fisherYatesArray<T = unknown>(arr: T[]): T[] {
  const resultArr: T[] = [...arr];
  const length: number = resultArr.length;

  for (let i = 0; i < length; i++) {
    const randomPosition = Math.floor((resultArr.length - i) * Math.random());
    const randomItem = resultArr.splice(randomPosition, 1);

    resultArr.push(...randomItem);
  }

  return resultArr;
}
