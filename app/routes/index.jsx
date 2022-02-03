import { useLoaderData, Link } from "remix";
import { getPosts } from "~/post";

export async function loader() {
  return getPosts();
}

export default function Posts() {
  let posts = useLoaderData();
  return (
    <section className="leading-7">
      <h1 className="text-4xl mb-4 font-bold">All Posts</h1>
      <ul className="flex flex-col">
        {posts.map(post => (
          <li key={post.slug}>
            <Link className="hover:text-indigo-800" to={post.slug}>
              <h2 className="mt-6 mb-2 text-2xl underline decoration-2 decoration-indigo-700 underline-offset-6">{post.title}</h2>
              <p>{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
