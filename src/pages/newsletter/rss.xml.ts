import rss from "@astrojs/rss";
import { newsletters } from "../../lib/markdoc/frontmatter.schema";
import { readAll } from "../../lib/markdoc/read";
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from "../../config";
import Markdoc from "@markdoc/markdoc";

export const get = async () => {
  const newsletterPosts = await readAll({
    directory: "newsletter",
    frontmatterSchema: newsletters,
  });

  let baseUrl = SITE_URL;
  // removing trailing slash if found
  // https://example.com/ => https://example.com
  baseUrl = baseUrl.replace(/\/+$/g, "");


  const rssNewsletters = newsletterPosts
  .filter((p) => p.frontmatter.draft !== true)
  .map(({ frontmatter, slug, content }) => {
    if (frontmatter.external) {
      const title = frontmatter.title;
      const pubDate = frontmatter.date;
      const link = frontmatter.url;
      const description = "";

      return {
        title,
        pubDate,
        description,
        content,
        link,
      };
    }

    const title = frontmatter.title;
    const pubDate = frontmatter.date;
    const description = frontmatter.description;
    const link = `${baseUrl}/newsletter/${slug}`;

    return {
      title,
      pubDate,
      description,
      content,
      link,
    };
  });

  const rssItems = rssNewsletters
  .sort(
    (a, b) =>
      new Date(b.pubDate).valueOf() -
      new Date(a.pubDate).valueOf()
  );

  return rss({
    title: "Mediations | " + SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: baseUrl + "/newsletter",
    items: rssItems.map((item) => {
      return {
        ...item,
        content: Markdoc.renderers.html(item.content)
      }
    }),
  });
};
