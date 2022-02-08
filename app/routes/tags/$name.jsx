import { useLoaderData, Link } from "remix";

import { getPosts, getTag } from "~/post.server";

/** @type {import("remix").LoaderFunction} */
export async function loader({ params }) {
  let name = params.name;
  return {
    posts: await getPosts({ tagname: name }),
    tag: await getTag(name)
  };
}

export default function Tag() {
  /** @type {{ posts: import("~/post.server").Post[], tag: import("~/post.server").Tag }} */
  let { posts, tag } = useLoaderData();
  return (
    <section className="leading-7">
      <h1 className="text-4xl mb-4 font-bold">Posts for {tag.isCategory ? "Category" : "Tag"} #{tag.name}</h1>
      <ul className="flex flex-col">
        {posts.map(post => (
          <li key={post.name}>
            <Link className="hover:text-indigo-800" to={`/${post.name}`}>
              <h2 className="mt-6 mb-2 text-2xl underline decoration-2 decoration-indigo-700 underline-offset-6">{post.title}</h2>
              <p>{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
