import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const places = [
  {
    slug: 'cot-co-lung-cu',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/06/lung-cu-flagpole.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/lung-cu-flagpole-2.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/lung-cu-flagpole-4.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/09/lung-cu-flagpole-7.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/09/lung-cu-flagpole-8.jpg',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Lung-Cu-Flag-Tower.webp',
    ],
  },
  {
    slug: 'dinh-nha-vuong',
    hero: 'https://authentiktravel.com/media/blog/hmong-king-palace-aut%20(2)%20(1).jpg',
    gallery: [
      'https://authentiktravel.com/media/ckeditor/hmong-king-palace-inside1.JPG',
      'https://authentiktravel.com/media/ckeditor/hmong-king-palace-above.JPG',
      'https://authentiktravel.com/media/ckeditor/ha%20giang%20vuong%20family%20palace%20stone%20carvings.jpg',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/The-Hmong-King-Palace-scaled.webp',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/The-Hmong-King-Palace-2.webp',
    ],
  },
  {
    slug: 'deo-ma-pi-leng',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/07/ma-pi-leng-pass-3.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/07/ma-pi-leng-pass-7.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/07/ma-pi-leng-pass-5.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/07/ma-pi-leng-pass-4.jpg',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/The-Nho-Que-River.webp',
      'https://vietadvisor.travel/wp-content/uploads/2025/06/Nho-Que-Boat-Ride.jpg',
    ],
  },
  {
    slug: 'pho-co-dong-van',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/09/dong-van-old-quarter.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/dong-van-old-quarter-1.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/dong-van-old-quarter-4.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/dong-van-old-quarter-5.jpg',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Dong-Van-Old-Quarter.webp',
      'https://vietadvisor.travel/wp-content/uploads/2025/06/Dong-Van-Ancient-Street.webp',
    ],
  },
  {
    slug: 'cao-nguyen-da-dong-van',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/04/dong-van-krast-plateau-6.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/dong-van-krast-plateau-4.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/dong-van-krast-plateau-9.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/dong-van-krast-plateau-16.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/dong-van-krast-plateau-3.jpg',
      'https://vietadvisor.travel/wp-content/uploads/2025/06/Dong-Van-Karst-Plateau.webp',
    ],
  },
  {
    slug: 'nui-doi-quan-ba',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/09/fairy-bosom-ha-giang-4.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/fairy-bosom-ha-giang-1.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/09/fairy-bosom-ha-giang-3.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/09/fairy-bosom-ha-giang-1.jpg',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Quan-Ba-Heaven-Gate.webp',
      'https://vietadvisor.travel/wp-content/uploads/2025/06/Heavens-Gate-Quan-Ba-Pass.jpg',
    ],
  },
  {
    slug: 'lang-lo-lo-chai',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2025/06/Lo-Lo-Chai-Village.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/things-to-do-in-dong-van-15.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/things-to-do-in-dong-van-16.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/things-to-do-in-dong-van-17.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/04/things-to-do-in-ha-giang-1-2.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/09/lung-cu-flagpole-9.jpg',
    ],
  },
  {
    slug: 'ruong-bac-thang-hoang-su-phi',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/08/hoang-su-phi-rice-terraces-1.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/08/hoang-su-phi-rice-terraces-2.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/08/hoang-su-phi-rice-terraces-3.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/08/hoang-su-phi-rice-terraces-8.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/08/hoang-su-phi-rice-terraces-9.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/08/hoang-su-phi-rice-terraces-14.jpg',
    ],
  },
  {
    slug: 'con-duong-hanh-phuc',
    hero: 'https://vietadvisor.travel/wp-content/uploads/2025/06/Ma-Pi-Leng-Sky-Walk.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/07/ma-pi-leng-ha-giang-14.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/07/ma-pi-leng-pass-8.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/07/ma-pi-leng-pass-6.jpg',
      'https://vietadvisor.travel/wp-content/uploads/2026/03/Ma-Pi-Leng-pass.webp',
      'https://vietadvisor.travel/wp-content/uploads/2025/06/Ma-Pi-Leng-Pass.webp',
    ],
  },
  {
    slug: 'nha-cua-pao',
    hero: 'https://hagiangamazingtours.com/wp-content/uploads/2023/06/paos-house-1.jpg',
    gallery: [
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/paos-house-2.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/paos-house-3.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/paos-house-5.jpg',
      'https://hagiangamazingtours.com/wp-content/uploads/2023/06/paos-house-8.jpg',
      'https://vietadvisor.travel/wp-content/uploads/2025/06/Sung-La-Valley.jpeg',
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
  for (const place of places) {
    const dir = path.join('public', 'places', place.slug);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`\n📦 ${place.slug}`);

    // hero
    try {
      const ext = place.hero.match(/\.(webp|jpg|jpeg|png)/i)?.[1] ?? 'jpg';
      const dest = path.join(dir, `hero.${ext === 'webp' ? 'jpg' : ext}`);
      await downloadFile(place.hero, dest);
      if (ext === 'webp') {
        const heroPath = path.join(dir, 'hero.jpg');
        if (!fs.existsSync(heroPath)) fs.renameSync(dest, heroPath);
      }
      console.log(`  ✓ hero`);
    } catch (e) {
      console.error(`  ✗ hero: ${e}`);
    }

    // gallery (5 items for places)
    for (let i = 0; i < place.gallery.length; i++) {
      const url = place.gallery[i];
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
