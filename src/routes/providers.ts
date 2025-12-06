import { Router } from "express";
import {
  createProvider,
  getAllProviders,
  getProviderById,
  getProviderBySlug,
  updateProvider,
  deleteProvider,
} from "../controllers/ProviderController";

const router = Router();

router.post("/", createProvider);
router.get("/", getAllProviders);
router.get("/:id", getProviderById);
router.get("/slug/:slug", getProviderBySlug);
router.put("/:id", updateProvider);
router.delete("/:id", deleteProvider);

export default router;
