import path from "path";
import fs from "fs/promises";

import parseFrontMatter from "front-matter";
import { fileTypeFromBuffer } from "file-type";
import { PrismaClient } from "@prisma/client";

let db = new PrismaClient();

let postsPath = path.join(__dirname, "..", "sample-posts");
let imagesPath = path.join(__dirname, "..", "sample-images");

async function seed() {
  let postsDir = await fs.readdir(postsPath);
  let posts = await Promise.all(postsDir.map(async filename => {
    let slug = filename.replace(/\.md$/, "");
    let post = await fs.readFile(path.join(postsPath, filename), { encoding: "utf8" });
    let { attributes: { title, tags, summary, date }, body } = parseFrontMatter(post);
    let createdAt = new Date(date.toISOString().substring(0, 10) + "T12:00:00+09:00");

    return {
      slug,
      title,
      body,
      summary,
      createdAt,
      tags
    };
  }));

  let tags = Array.from(new Set(posts.flatMap(post => post.tags)));

  for (let { slug, title, body, summary, createdAt, tags } of posts) {
    let data = {
      slug,
      title,
      body,
      summary,
      createdAt,
      tags: {
        connectOrCreate: tags.map(tagName => ({
          where: { name: tagName },
          create: {
            name: tagName,
            isProminent: ["Dev", "Algorithm"].includes(tagName)
          }
        }))
      }
    };
    await db.post.upsert({
      where: { slug },
      create: data,
      update: data
    });
  };

  let imagesDir = await fs.readdir(imagesPath);
  let images = await Promise.all(imagesDir.map(async name => {
    let bytes = await fs.readFile(path.join(imagesPath, name));
    let { mime } = await fileTypeFromBuffer(bytes);
    return {
      name,
      bytes,
      mime
    };
  }));

  await db.image.createMany({
    data: images,
    skipDuplicates: true
  });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
