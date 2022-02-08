import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLoaderData
} from "remix";

import { getTags } from "~/post.server";

import hljsStyles from "./styles/hljs.css";
import styles from "./tailwind.css";

export function meta() {
  return { title: "@goranmoomin's Blog" };
}

export function links() {
  return [{
    rel: "preconnect",
    href: "https://fonts.googleapis.com"
  }, {
    rel: "preconnect",
    href: "https://fonts.gstatic.com"
  }, {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Hahmlet:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;700&display=swap"
  }, {
    rel: "stylesheet",
    href: hljsStyles
  }, {
    rel: "stylesheet",
    href: styles
  }];
}

/** @type {import("remix").LoaderFunction} */
export async function loader() {
  let tags = await getTags();
  let categories = tags.filter(tag => tag.isCategory);
  return categories;
}

export default function App() {
  /** @type {import("~/post.server").Tag[]} */
  let categories = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="sticky top-0 z-10 bg-white border border-b-indigo-700">
          <nav className="h-16 mx-auto w-11/12 lg:max-w-3xl flex gap-4 items-center">
            <span className="text-2xl font-bold">
              <Link to="/">미완성된 블로그</Link>
            </span>
            <Link to="/" className="align-middle font-bold text-indigo-700">Posts</Link>
            {categories.map(category => (
              <Link key={category.name} to={`/tags/${category.name.toLowerCase()}`} className="align-middle font-bold text-indigo-700">{category.name}</Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto my-12 w-11/12 lg:max-w-3xl">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
