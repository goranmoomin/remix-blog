import { useLoaderData, Link } from "remix";

import { getPost, getTags } from "~/post.server";

/** @type {import("remix").LoaderFunction} */
export async function loader({ params }) {
  let post = await getPost(params.name);
  let tags = await getTags(post.tagnames);
  return {
    post,
    tags
  };
}

export default function Post() {
  /** @type {{ post: import("~/post.server").Post & { html: string }, tags: import("~/post.server").Tag[] }} */
  let { post, tags } = useLoaderData();
  // FIXME: Workaround for Date not being serializable
  post.createdAt = new Date(post.createdAt);
  let categories = tags.filter(tag => tag.isCategory);
  let ordinaryTags = tags.filter(tag => !tag.isCategory);
  return (
    <article className="flex flex-col leading-7">
      <h1 className="text-4xl mb-4 font-bold">{post.title}</h1>
      <div className="text-sm">
        <span className="uppercase">{new Date(post.createdAt).toDateString()} · </span>
        {categories.length > 0 ? "Categories: " : null}
        {categories.map((category, idx) => (
          <span key={category.name}>
            { idx != 0 ? " · " : null}
            <Link className="text-indigo-700 underline decoration-2 underline-offset-4" to={`/tags/${category.name.toLowerCase()}`}>{category.name}</Link>
          </span>
        ))}
        {ordinaryTags.length > 0 ? " · Tags: " : null}
        {ordinaryTags.map((tag, idx) => (
          <span key={tag.name}>
            { idx != 0 ? " · " : null}
            <Link className="text-indigo-700 underline decoration-2 underline-offset-4" to={`/tags/${tag.name.toLowerCase()}`}>{tag.name}</Link>
          </span>
        ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article >
  );
}
