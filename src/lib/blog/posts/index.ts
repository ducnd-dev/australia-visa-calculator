import type { BlogPost } from "../types";
import { post as post189 } from "./189-vs-190-vs-491";
import { post as postAge } from "./age-points-skilled-migration";
import { post as postHowMany } from "./how-many-points-for-australian-pr";
import { post as postIncrease } from "./how-to-increase-australia-pr-points";
import { post as postPartner } from "./partner-skills-points-australia";
import { post as postPte } from "./pte-vs-ielts-for-australian-migration";
import { post as postEmployment } from "./skilled-employment-cap-20-points";
import { post as postState } from "./state-nomination-190-491-points";

const allPosts: BlogPost[] = [
  postHowMany,
  post189,
  postIncrease,
  postPte,
  postState,
  postPartner,
  postAge,
  postEmployment,
].sort((a, b) => (a.date < b.date ? 1 : -1));

export function getBlogPosts(): BlogPost[] {
  return allPosts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = getBlogPost(slug);
  if (!post?.relatedSlugs?.length) {
    return allPosts.filter((p) => p.slug !== slug).slice(0, limit);
  }
  return post.relatedSlugs
    .map((s) => getBlogPost(s))
    .filter((p): p is BlogPost => !!p)
    .slice(0, limit);
}
