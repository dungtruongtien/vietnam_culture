import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const dishes = [
  {
    slug: 'ha-giang-men-men',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2026/03/Men-Men-Steamed-Minced-Corn-2-scaled.webp',
    gallery: [
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Men-Men-Steamed-Minced-Corn-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Men-Men-Steamed-Minced-Corn-3-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Men-Men-Steamed-Minced-Corn-4-scaled.webp',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-4.jpg',
    ],
  },
  {
    slug: 'ha-giang-thang-co',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2026/03/Thang-Co-The-Infamous-Horse-Stew-2-scaled.webp',
    gallery: [
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Thang-Co-The-Infamous-Horse-Stew-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Thang-Co-The-Infamous-Horse-Stew-3-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Thang-Co-The-Infamous-Horse-Stew-4-scaled.webp',
      'https://authentiktravel.com/media/ckeditor/ha%20giang%20special%20thang%20co%20soup.jpg',
    ],
  },
  {
    slug: 'ha-giang-chao-au-tau',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2026/03/Au-Tau-Porridge-2-scaled.webp',
    gallery: [
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Au-Tau-Porridge-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Au-Tau-Porridge-3-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Au-Tau-Porridge-4-scaled.webp',
      'https://authentiktravel.com/media/ckeditor/ha%20giang%20special%20au%20tau%20porridge.jpg',
    ],
  },
  {
    slug: 'ha-giang-lon-cap-nach',
    hero: 'https://authentiktravel.com/media/ckeditor/ha%20giang%20special%20dwarf%20pig.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-8.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-7.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-3.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-10.jpg',
    ],
  },
  {
    slug: 'ha-giang-pho-trang-kim',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-5.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-1-2.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-1.1.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/a1_10.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-4-1.jpg',
    ],
  },
  {
    slug: 'ha-giang-banh-cuon-trung',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2026/03/Banh-Cuon-Dong-Van-2-scaled.webp',
    gallery: [
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Banh-Cuon-Dong-Van.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Banh-Cuon-Dong-Van-3-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Banh-Cuon-Dong-Van-4-scaled.webp',
      'https://authentiktravel.com/media/ckeditor/ha%20giang%20special%20egg%20pancake.jpg',
    ],
  },
  {
    slug: 'ha-giang-thang-den',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-2.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-3-1.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-5-1.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/ha-giang-food-1-1.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2026/06/z7920094449299_8f13253ca306861c26dfad5349dbf0dc.jpg',
    ],
  },
  {
    slug: 'ha-giang-xoi-ngu-sac',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2026/03/Five-Colored-Sticky-Rice-4-scaled.webp',
    gallery: [
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Five-Colored-Sticky-Rice-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Five-Colored-Sticky-Rice-2.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Five-Colored-Sticky-Rice-3-scaled.webp',
      'https://authentiktravel.com/media/ckeditor/ha%20giang%20special%20sticky%20rice.jpg',
    ],
  },
  {
    slug: 'ha-giang-banh-tam-giac-mach',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2026/03/Buckwheat-Cake-2-scaled.webp',
    gallery: [
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Buckwheat-Cake-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Buckwheat-Cake-3-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Buckwheat-Cake-4-scaled.webp',
      'https://authentiktravel.com/media/ckeditor/ha%20giang%20special%20buckwheat%20cake.jpg',
    ],
  },
  {
    slug: 'ha-giang-thit-gac-bep',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2026/03/Smoked-Buffalo-Meat-5-scaled.webp',
    gallery: [
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Smoked-Buffalo-Meat-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Smoked-Buffalo-Meat-2.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Smoked-Buffalo-Meat-3.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Smoked-Buffalo-Meat-4-scaled.webp',
    ],
  },
];

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location!;
        file.close();
        fs.unlink(dest, () => {});
        downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const dish of dishes) {
    const dir = path.join('public', 'food', dish.slug);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`\n📦 ${dish.slug}`);

    // hero
    try {
      const ext = dish.hero.match(/\.(webp|jpg|jpeg|png)/i)?.[1] ?? 'jpg';
      const dest = path.join(dir, `hero.${ext === 'webp' ? 'jpg' : ext}`);
      await downloadFile(dish.hero, dest);
      // rename to hero.jpg if webp
      if (ext === 'webp') {
        const heroPath = path.join(dir, 'hero.jpg');
        if (!fs.existsSync(heroPath)) fs.renameSync(dest, heroPath);
      }
      console.log(`  ✓ hero`);
    } catch (e) {
      console.error(`  ✗ hero: ${e}`);
    }

    // gallery
    for (let i = 0; i < dish.gallery.length; i++) {
      const url = dish.gallery[i];
      const n = i + 1;
      try {
        const dest = path.join(dir, `gallery-${n}.jpg`);
        await downloadFile(url, dest);
        console.log(`  ✓ gallery-${n}`);
      } catch (e) {
        console.error(`  ✗ gallery-${n}: ${e}`);
      }
    }
  }
  console.log('\n✅ Done');
}

main().catch(console.error);
