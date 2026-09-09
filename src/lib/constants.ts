
export const PLAN_LIMITS = {
  EXPRESS: {
    links: 3,
    galleryImages: 0,
    products: 0,
    allowLocation: false,
    allowThemeColor: false,
    allowBooking: false,
    maxSlugLength: 30,
  },
  EMPRENDEDOR: {
    links: 10,
    galleryImages: 5,
    products: 5,
    allowLocation: true,
    allowThemeColor: true,
    allowBooking: true,
    maxSlugLength: 50,
  },
  PREMIUM: {
    links: 50,
    galleryImages: 12,
    products: 50,
    allowLocation: true,
    allowThemeColor: true,
    allowBooking: true,
    maxSlugLength: 100,
  },
};
