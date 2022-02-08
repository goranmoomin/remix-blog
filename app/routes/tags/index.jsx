import { useLoaderData, Link } from "remix";

import { getTags } from "~/post.server";

/** @type {import("remix").LoaderFunction} */
export async function loader() {
  return await getTags();
}

export default function Tags() {
  /** @type {import("~/post.server").Tag[]} */
  let tags = useLoaderData();
  return (
    <>
      <section className="leading-7 my-12">
        <h2 className="text-4xl mb-4 font-bold">Categories</h2>
        <ul className="flex flex-col">
          {tags.filter(tag => tag.isCategory).map(tag => (
            <li key={tag.name}>
              <Link className="hover:text-indigo-800" to={`/tags/${tag.name}`}>
                <h3 className="my-2 text-lg underline decoration-2 decoration-indigo-700 underline-offset-6">{tag.name}</h3>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="leading-7 my-12">
        <h2 className="text-4xl mb-4 font-bold">Tags</h2>
        <ul className="flex flex-col">
          {tags.filter(tag => !tag.isCategory).map(tag => (
            <li key={tag.name}>
              <Link className="hover:text-indigo-800" to={`/tags/${tag.name}`}>
                <h3 className="my-2 text-lg underline decoration-2 decoration-indigo-700 underline-offset-6">{tag.name}</h3>
              </Link>
            </li>
          ))}
        </ul></section>
    </>
  );
}
