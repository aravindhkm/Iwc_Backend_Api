// import { version }  from '../../package.json';
import config  from '../config/config.js';

export const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'node-express-boilerplate API documentation',
    version: "1.7.0",
    license: {
      name: 'MIT',
      url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

// module.exports = swaggerDef;
