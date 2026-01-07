// src/app/modules/wishlist/wishlist.route.ts
import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { WishlistController } from "./wishlist.controller";

const router = express.Router();

// router.post(
//     "/",
//     auth(UserRole.TOURIST),
//     WishlistController.addToWishlist
// );


router.get(
    "/my",
    auth(UserRole.TOURIST),
    WishlistController.getMyWishlist
);

router.get(
    "/check/:tourId",
    auth(),
    WishlistController.checkWishlist
);

router.post(
    "/toggle",
    auth(UserRole.TOURIST),
    WishlistController.toggleWishlist
);

// router.delete(
//     "/:tourId",
//     auth(UserRole.TOURIST),
//     WishlistController.removeFromWishlist
// );

export const WishlistRoutes = router;
