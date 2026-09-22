import { Router, RequestHandler } from "express";
import { ContentRepository, ContentFilters } from "../interfaces/ContentRepository";
import { ContentItem } from "../models/ContentItem";
import { Article } from "../models/Article";

function queryString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function toSummary(item: ContentItem) {
  return {
    id: item.id,
    title: item.title,
    author: item.author,
    price: item.price,
    category: item instanceof Article ? item.category : undefined,
    preview: item.preview(),
  };
}

export function createArticleRouter(
  articles: ContentRepository,
  paymentGateway: RequestHandler
): Router {
  const router = Router();

  // Browse: GET /articles?category=business&keyword=fees&author=Priya%20Raman
  router.get("/", async (req, res) => {
    const filters: ContentFilters = {
      category: queryString(req.query.category),
      keyword: queryString(req.query.keyword),
      author: queryString(req.query.author),
    };
    const results = await articles.getAll(filters);
    res.json(results.map(toSummary));
  });

  // Free preview: GET /articles/:id/preview
  router.get("/:id/preview", async (req, res) => {
    const id = req.params.id;
    if (typeof id !== "string") {
      res.status(400).json({ error: "invalid article id" });
      return;
    }

    const item = await articles.getById(id);
    if (!item) {
      res.status(404).json({ error: "article not found" });
      return;
    }
    res.json(toSummary(item));
  });

  // Paid article: GET /articles/:id (runs the payment gateway first)
  router.get("/:id", paymentGateway, (req, res) => {
    const item = res.locals.article as ContentItem;
    res.json({
      ...toSummary(item),
      body: item instanceof Article ? item.body : undefined,
    });
  });

  return router;
}