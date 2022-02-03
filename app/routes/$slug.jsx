import { redirect, useLoaderData, Link } from "remix";
import { getPost } from "~/post";
import { db } from "~/utils/db.server";

/** @type {import("remix").LoaderFunction} */
export async function loader({ params }) {
  return await getPost(params.slug);
}

/** @type {import("remix").ActionFunction} */
export async function action({ request, params }) {
  let form = await request.formData();
  if (form.get("_method") === "delete") {
    let slug = encodeURIComponent(params.slug);
    await db.post.delete({
      where: { slug },
    });
  }

  return redirect("/");
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
        {" · "}
        <form className="inline" method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="uppercase">Delete</button>
        </form>
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article >
  );
}
