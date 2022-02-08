import { getImage } from "~/post.server";

/** @type {import("remix").LoaderFunction} */
export async function loader({ params }) {
  let image = await getImage(params.name);
  return new Response(image.stream, {
    status: 200,
    headers: {
      "Content-Type": image.mime
    }
  });
}
