export default async function LibrariesTable() {
  return await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/mounts/bucket/123`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      return <div>Data...</div>;
    })
    .catch((err) => {
      console.error(err);

      return <p>Error</p>;
    });
}
