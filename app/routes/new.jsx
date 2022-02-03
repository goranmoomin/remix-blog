import { redirect, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "remix";
import { slugify } from "transliteration";

import { Buffer } from "~/utils/buffer.server";
import { db } from "~/utils/db.server";

/** @type {import("remix").ActionFunction} */
export async function action({ request }) {
  let uploadHandler = unstable_createMemoryUploadHandler({
    filter: ({ mimetype }) => mimetype.startsWith("image/")
  });
  let form = await unstable_parseMultipartFormData(request, uploadHandler);
  let title = form.get("title");
  let tags = form.get("tags")?.split(/,\s*/);
  let summary = form.get("summary");
  let body = form.get("body");
  /** @type {File[]} */
  let images = form.getAll("images");
  let createdAt = new Date();
  let slug = encodeURIComponent(slugify(title));
  let post = await db.post.create({
    data: {
      slug,
      title,
      summary,
      body,
      createdAt,
      tags: {
        connectOrCreate: tags.map(tagName => ({
          where: { name: tagName },
          create: { name: tagName }
        }))
      }
    }
  });
  await db.image.createMany({
    data: await Promise.all(images.map(async image => ({
      name: image.name,
      mime: image.type,
      bytes: Buffer.from(await image.arrayBuffer())
    }))),
    skipDuplicates: true
  });
  return redirect(`/${post.slug}`);
}

export default function NewPost() {
  return (
    <section className="leading-7">
      <form className="flex flex-col gap-4" method="post" encType="multipart/form-data">
        <label className="flex flex-col gap-2">
          {"Title: "}
          <input className="block p-1 border border-indigo-700 rounded" type="text" name="title" />
        </label>
        <label className="flex flex-col gap-2">
          {"Tags: "}
          <input className="block p-1 border border-indigo-700 rounded" type="text" name="tags" />
        </label>
        <label className="flex flex-col gap-2">
          {"Summary: "}
          <input className="block p-1 border border-indigo-700 rounded" type="text" name="summary" />
        </label>
        <label className="flex flex-col gap-2">
          {"Body: "}
          <textarea className="block min-h-[10em] p-1 border border-indigo-700 rounded" name="body" />
        </label>
        <label>
          {"Images: "}
          <input type="file" name="images" accept="image/*" multiple />
        </label>
        <button className="p-1 rounded hover:bg-slate-100" type="submit">Create Post</button>
      </form>
    </section>
  );
}
