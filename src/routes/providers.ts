import { Router } from "express";
import {
  createProvider,
  getAllProviders,
  getProviderById,
  getProviderBySlug,
  updateProvider,
  deleteProvider,
} from "../controllers/ProviderController";
import { checkAdmin } from "../middleware/role";

const router = Router();

router.get("/", getAllProviders);
router.get("/:id", getProviderById);
router.get("/slug/:slug", getProviderBySlug);

// only admin can create, update, delete providers
router.use(checkAdmin);
router.post("/",  createProvider);
router.put("/:id", updateProvider);
router.delete("/:id", deleteProvider);

export default router;
