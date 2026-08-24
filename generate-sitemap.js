// generate-sitemap.js
const sitemap = require('react-router-sitemap');
const fs = require('fs');
const path = require('path');

const routes = [
  '/',
  '/contacto',
  '/servicios',
  // añade aquí todas las rutas de tu app
];

const domain = 'https://dietetica-integral.com';

sitemap(routes, domain)
  .build()
  .save(path.resolve(__dirname, 'dist', 'sitemap.xml'));