import { db } from "~/utils/db.server";

/** @type {import("remix").LoaderFunction} */
export async function loader({ params }) {
  let image = await db.image.findUnique({
    where: {
      name: params.name
    }
  });
  if (!image.mime.startsWith("image/")) {
    throw new Response({
      status: 401
    });
  }
  return new Response(image.bytes, {
    status: 200,
    headers: {
      "Content-Type": image.mime
    }
  });
}
