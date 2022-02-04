import { useLoaderData, Link } from "remix";
import { getPosts } from "~/post.server";

/** @type {import("remix").LoaderFunction} */
export async function loader({ params: { tag } }) {
  return {
    posts: await getPosts({ tag }),
    tag
  };
}

export default function Tag() {
  let { posts, tag } = useLoaderData();
  return (
    <section className="leading-7">
      <h1 className="text-4xl mb-4 font-bold">Posts for {tag}</h1>
      <ul className="flex flex-col">
        {posts.map(post => (
          <li key={post.slug}>
            <Link className="hover:text-indigo-800" to={`/${post.slug}`}>
              <h2 className="mt-6 mb-2 text-2xl underline decoration-2 decoration-indigo-700 underline-offset-6">{post.title}</h2>
              <p>{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
