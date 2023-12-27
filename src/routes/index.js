import express  from 'express';
import nftRoute  from './point.route.js';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/points',
    route: nftRoute,
  }
];


defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
