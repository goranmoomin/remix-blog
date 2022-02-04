import { redirect, useLoaderData, Link } from "remix";
import { getPost } from "~/post.server";

/** @type {import("remix").LoaderFunction} */
export async function loader({ params }) {
  return await getPost(params.slug);
}

export default function Post() {
  let post = useLoaderData();
  return (
    <article className="flex flex-col leading-7">
      <h1 className="text-4xl mb-4 font-bold">{post.title}</h1>
      <div className="text-sm">
        <span className="uppercase">{new Date(post.createdAt).toDateString()} · </span>
        {"Categories: "}
        {post.tags.filter(tag => tag.isProminent).map((tag, idx) => (
          <span key={tag.name}>
            { idx != 0 ? " · " : null}
            <Link className="text-indigo-700 underline decoration-2 underline-offset-4" to={`/tags/${tag.name}`}>{tag.name}</Link>
          </span>
        ))}
        {" · Tags: "}
        {post.tags.filter(tag => !tag.isProminent).map((tag, idx) => (
          <span key={tag.name}>
            {idx != 0 ? " · " : null}
            <Link className="text-indigo-700 underline decoration-2 underline-offset-4" to={`/tags/${tag.name}`}>{tag.name}</Link>
          </span>
        ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article >
  );
}
