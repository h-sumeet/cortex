import { Router } from "express";
import {
  createTopic,
  getAllTopics,
  getTopicById,
  getTopicBySlug,
  getTopicsByProviderId,
  getTopicsByProviderSlug,
  updateTopic,
  deleteTopic,
} from "../controllers/TopicController";

const router = Router();

router.post("/", createTopic);
router.get("/", getAllTopics);
router.get("/:id", getTopicById);
router.get("/slug/:slug", getTopicBySlug);
router.get("/provider/:providerId", getTopicsByProviderId);
router.get("/provider/slug/:slug", getTopicsByProviderSlug);
router.put("/:id", updateTopic);
router.delete("/:id", deleteTopic);

export default router;
