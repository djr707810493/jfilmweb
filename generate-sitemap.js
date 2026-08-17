const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");
const fs = require('fs');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generate() {
  const siteUrl = "https://www.jfilmstudio.com";
  const urls = [];

  // Static URLs
  urls.push("<url><loc>" + siteUrl + "</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>");
  urls.push("<url><loc>" + siteUrl + "/weddings</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>");
  urls.push("<url><loc>" + siteUrl + "/portfolio</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>");
  urls.push("<url><loc>" + siteUrl + "/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>");
  urls.push("<url><loc>" + siteUrl + "/contact</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>");

  // Portfolio Projects
  const portfolioSnap = await getDocs(query(collection(db, "portfolioProjects"), where("published", "==", true)));
  portfolioSnap.forEach(doc => {
    const data = doc.data();
    urls.push("<url><loc>" + siteUrl + "/portfolio/item/?slug=" + data.slug + "</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>");
  });

  // Wedding Stories
  const storiesSnap = await getDocs(query(collection(db, "weddingStories"), where("published", "==", true)));
  storiesSnap.forEach(doc => {
    const data = doc.data();
    urls.push("<url><loc>" + siteUrl + "/weddings/" + data.slug + "</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>");
  });

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ' +
  urls.join("\n  ") + '\n' +
'</urlset>';

  fs.writeFileSync('public/sitemap.xml', xml);
  console.log(xml);
}

generate().catch(console.error);
