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
import { checkAdmin } from "../middleware/role";

const router = Router();

router.get("/", getAllTopics);
router.get("/:id", getTopicById);
router.get("/slug/:slug", getTopicBySlug);
router.get("/provider/:providerId", getTopicsByProviderId);
router.get("/provider/slug/:slug", getTopicsByProviderSlug);

// only admin can create, update, delete topics
router.use(checkAdmin);
router.post("/", createTopic);
router.put("/:id", updateTopic);
router.delete("/:id", deleteTopic);

export default router;
