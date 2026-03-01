
// Define limits per plan
export const PLAN_LIMITS = {
  EXPRESS: {
    galleryImages: 0,
    allowLocation: false,
    allowThemeColor: false,
    allowProducts: false,
  },
  EMPRENDEDOR: {
    galleryImages: 5,
    allowLocation: true,
    allowThemeColor: true,
    allowProducts: false,
  },
  PREMIUM: {
    galleryImages: 12,
    allowLocation: true,
    allowThemeColor: true,
    allowProducts: true,
  },
};
