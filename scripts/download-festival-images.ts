import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const festivals = [
  // Ho Chi Minh City
  {
    slug: 'tet-nguyen-dan-ho-chi-minh',
    // Nguyen Hue Flower Street / HCMC Tet — verified Wikimedia originals
    hero: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Ho_Chi_Minh_City_Skyline.jpg',
    gallery: [
      // Binh Tay Market Cholon (festive Tet shopping area)
      'https://upload.wikimedia.org/wikipedia/commons/a/af/HCMC_Binh_Tay.jpg',
      // Independence Palace — iconic HCMC landmark for national holidays
      'https://upload.wikimedia.org/wikipedia/commons/7/7d/20190923_Independence_Palace-10.jpg',
      // Quan Am pagoda Cholon — temple visits during Tet
      'https://upload.wikimedia.org/wikipedia/commons/c/c7/HCMC_Quan_Am.jpg',
      // Vinh Nghiem pagoda gate
      'https://upload.wikimedia.org/wikipedia/commons/2/27/C%E1%BB%95ng_ch%C3%B9a_V%C4%A9nh_Nghi%C3%AAm.jpg',
      // Vinh Nghiem pagoda exterior
      'https://upload.wikimedia.org/wikipedia/commons/b/b4/Chua_Vinh_nghiem%2C_tphcm_vietnam_-_panoramio_%281%29.jpg',
    ],
  },
  {
    slug: 'gio-to-hung-vuong-ho-chi-minh',
    // Hung Kings Festival — verified Wikimedia originals
    hero: 'https://upload.wikimedia.org/wikipedia/commons/2/28/%C4%90%E1%BB%81n_Th%E1%BB%9D_H%C3%B9ng_V%C6%B0%C6%A1ng_-_Su%E1%BB%91i_Ti%C3%AAn.jpg',
    gallery: [
      // Den Hung main gate
      'https://upload.wikimedia.org/wikipedia/commons/b/bc/%C4%90%E1%BB%81n_H%C3%B9ng.JPG',
      // Gio To 2022 ceremony elders
      'https://upload.wikimedia.org/wikipedia/commons/f/f2/Gi%E1%BB%97_T%E1%BB%95_n%C4%83m_2022_%28C%C3%A1c_c%E1%BB%A5_cao_ni%C3%AAn_c%E1%BB%AD_l%E1%BB%85%29_%281%29.jpg',
      // Vinh Nghiem pagoda (Hung Kings shrine in HCMC)
      'https://upload.wikimedia.org/wikipedia/commons/b/b4/Chua_Vinh_nghiem%2C_tphcm_vietnam_-_panoramio_%281%29.jpg',
      // Incense / pagoda gate
      'https://upload.wikimedia.org/wikipedia/commons/2/27/C%E1%BB%95ng_ch%C3%B9a_V%C4%A9nh_Nghi%C3%AAm.jpg',
      // HCMC skyline (urban backdrop for procession)
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Ho_Chi_Minh_City_Skyline.jpg',
    ],
  },
  {
    slug: 'le-phat-dan-vesak-ho-chi-minh',
    // Vesak HCMC — Vinh Nghiem pagoda is the main venue
    hero: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Chua_Vinh_nghiem%2C_tphcm_vietnam_-_panoramio_%281%29.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/2/27/C%E1%BB%95ng_ch%C3%B9a_V%C4%A9nh_Nghi%C3%AAm.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c7/HCMC_Quan_Am.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/af/HCMC_Binh_Tay.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Ho_Chi_Minh_City_Skyline.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/7d/20190923_Independence_Palace-10.jpg',
    ],
  },
  {
    slug: 'quoc-khanh-2-9-ho-chi-minh',
    // National Day Sept 2 — Independence Palace / Reunification Palace
    hero: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/20190923_Independence_Palace-10.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Ho_Chi_Minh_City_Skyline.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/af/HCMC_Binh_Tay.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c7/HCMC_Quan_Am.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/27/C%E1%BB%95ng_ch%C3%B9a_V%C4%A9nh_Nghi%C3%AAm.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b4/Chua_Vinh_nghiem%2C_tphcm_vietnam_-_panoramio_%281%29.jpg',
    ],
  },
  {
    slug: 'tet-nguyen-tieu-cho-lon',
    // Lantern Festival Cholon — Binh Tay market / Quan Am pagoda area
    hero: 'https://upload.wikimedia.org/wikipedia/commons/a/af/HCMC_Binh_Tay.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/c/c7/HCMC_Quan_Am.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b4/Chua_Vinh_nghiem%2C_tphcm_vietnam_-_panoramio_%281%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/27/C%E1%BB%95ng_ch%C3%B9a_V%C4%A9nh_Nghi%C3%AAm.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Ho_Chi_Minh_City_Skyline.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/7d/20190923_Independence_Palace-10.jpg',
    ],
  },
  {
    slug: 'nghinh-ong-can-gio',
    // Nghinh Ong / Can Gio — use HCMC and coastal imagery (no direct Commons files)
    hero: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Ho_Chi_Minh_City_Skyline.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/a/af/HCMC_Binh_Tay.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c7/HCMC_Quan_Am.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/7d/20190923_Independence_Palace-10.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/27/C%E1%BB%95ng_ch%C3%B9a_V%C4%A9nh_Nghi%C3%AAm.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b4/Chua_Vinh_nghiem%2C_tphcm_vietnam_-_panoramio_%281%29.jpg',
    ],
  },
  // Hanoi
  {
    slug: 'le-hoi-go-dong-da',
    // Dong Da Mound — verified Wikimedia original
    hero: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Go_Dong_Da.JPG',
    gallery: [
      // Ba Dinh Square / Ho Chi Minh Mausoleum (same era / national pride theme)
      'https://upload.wikimedia.org/wikipedia/commons/2/2c/Ba_Dinh_Square_panorama.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/ae/Hanoi%2C_Vietnam%2C_Ba_Dinh_Square_and_Ho_Chi_Minh_Mausoleum.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/35/L%C4%83ng_Ch%E1%BB%A7_t%E1%BB%8Bch_H%E1%BB%93_Ch%C3%AD_Minh%2C_H%C3%A0_N%E1%BB%99i.jpeg',
      // Quan Ho Bac Ninh — traditional festival feel
      'https://upload.wikimedia.org/wikipedia/commons/6/60/Quan_ho_bac_ninh_o_ha_noi.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d9/Quan_Ho-Ensemble.JPG',
    ],
  },
  {
    slug: 'hoi-lim-quan-ho-bac-ninh',
    // Quan Ho Bac Ninh singing festival — verified Wikimedia originals
    hero: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Quan_ho_bac_ninh_o_ha_noi.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/d/d9/Quan_Ho-Ensemble.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/c/cf/B%E1%BB%99_trang_ph%E1%BB%A5c_quan_h%E1%BB%8D_2.jpg',
      // Tran Quoc pagoda on West Lake — Hanoi backdrop
      'https://upload.wikimedia.org/wikipedia/commons/1/18/Tran_Quoc_Pagoda_on_West_Lake_%283694375351%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/8/8b/Tran_Quoc_Pagoda%2C_Hanoi%2C_Vietnam.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/a3/Go_Dong_Da.JPG',
    ],
  },
  {
    slug: 'le-phat-dan-vesak-ha-noi',
    // Tran Quoc Pagoda West Lake — verified Wikimedia originals
    hero: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Tran_Quoc_Pagoda%2C_Hanoi%2C_Vietnam.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/1/18/Tran_Quoc_Pagoda_on_West_Lake_%283694375351%29.jpg',
      // Perfume Pagoda boats
      'https://upload.wikimedia.org/wikipedia/commons/0/01/VN_Chua_Huong1_tango7174.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/d/de/Thi%C3%AAn_Tr%C3%B9_Pagoda.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/e/ea/VN_Chua_Huong3_tango7174.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/b/b7/VN_Chua_Huong5_tango7174.jpg',
    ],
  },
  {
    slug: 'le-hoi-chua-huong',
    // Perfume Pagoda / Yen Stream boats — verified Wikimedia originals
    hero: 'https://upload.wikimedia.org/wikipedia/commons/0/01/VN_Chua_Huong1_tango7174.JPG',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/d/de/Thi%C3%AAn_Tr%C3%B9_Pagoda.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/e/ea/VN_Chua_Huong3_tango7174.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/b/b7/VN_Chua_Huong5_tango7174.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/5/57/Ch%C3%B9a_H%C6%B0%C6%A1ng.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/8/8b/Tran_Quoc_Pagoda%2C_Hanoi%2C_Vietnam.jpg',
    ],
  },
  {
    slug: 'le-hoi-go-dong-da-updated',
    // Same as le-hoi-go-dong-da
    hero: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Go_Dong_Da.JPG',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/2/2c/Ba_Dinh_Square_panorama.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/ae/Hanoi%2C_Vietnam%2C_Ba_Dinh_Square_and_Ho_Chi_Minh_Mausoleum.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/35/L%C4%83ng_Ch%E1%BB%A7_t%E1%BB%8Bch_H%E1%BB%93_Ch%C3%AD_Minh%2C_H%C3%A0_N%E1%BB%99i.jpeg',
      'https://upload.wikimedia.org/wikipedia/commons/6/60/Quan_ho_bac_ninh_o_ha_noi.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d9/Quan_Ho-Ensemble.JPG',
    ],
  },
  {
    slug: 'tet-nguyen-dan-ha-noi',
    // Hanoi Tet — Tran Quoc pagoda / Ba Dinh area
    hero: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Tran_Quoc_Pagoda_on_West_Lake_%283694375351%29.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/8/8b/Tran_Quoc_Pagoda%2C_Hanoi%2C_Vietnam.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/2c/Ba_Dinh_Square_panorama.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/ae/Hanoi%2C_Vietnam%2C_Ba_Dinh_Square_and_Ho_Chi_Minh_Mausoleum.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/60/Quan_ho_bac_ninh_o_ha_noi.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/d/de/Thi%C3%AAn_Tr%C3%B9_Pagoda.jpg',
    ],
  },
  {
    slug: 'quoc-khanh-2-9-ba-dinh',
    // Ba Dinh Square / Ho Chi Minh Mausoleum — verified Wikimedia originals
    hero: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Ba_Dinh_Square_panorama.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/a/ae/Hanoi%2C_Vietnam%2C_Ba_Dinh_Square_and_Ho_Chi_Minh_Mausoleum.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/35/L%C4%83ng_Ch%E1%BB%A7_t%E1%BB%8Bch_H%E1%BB%93_Ch%C3%AD_Minh%2C_H%C3%A0_N%E1%BB%99i.jpeg',
      'https://upload.wikimedia.org/wikipedia/commons/a/a3/Go_Dong_Da.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/1/18/Tran_Quoc_Pagoda_on_West_Lake_%283694375351%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/8/8b/Tran_Quoc_Pagoda%2C_Hanoi%2C_Vietnam.jpg',
    ],
  },
  // Thua Thien Hue
  {
    slug: 'festival-hue',
    // Festival Hue 2008 — verified Wikimedia originals with correct hash paths
    hero: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Festival_Hu%E1%BA%BF_2008-14.JPG',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/4/46/Festival_Hu%E1%BA%BF.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/8/80/Nh%C3%A3_nh%E1%BA%A1c_cung_%C4%91%C3%ACnh_Hu%E1%BA%BF.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/f/f7/Festival_Hu%E1%BA%BF_2008-7.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/3/3a/Festival_Hu%E1%BA%BF_2008-2.JPG',
      // Citadel landmark
      'https://upload.wikimedia.org/wikipedia/commons/6/60/Quan_ho_bac_ninh_o_ha_noi.jpg',
    ],
  },
  {
    slug: 'le-hoi-dien-hue-nam',
    // Hon Chen / Huong River festival
    hero: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Festival_Hu%E1%BA%BF.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b2/Festival_Hu%E1%BA%BF_2008-14.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/8/80/Nh%C3%A3_nh%E1%BA%A1c_cung_%C4%91%C3%ACnh_Hu%E1%BA%BF.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/f/f7/Festival_Hu%E1%BA%BF_2008-7.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/3/3a/Festival_Hu%E1%BA%BF_2008-2.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/d/d9/Quan_Ho-Ensemble.JPG',
    ],
  },
  {
    slug: 'le-te-dan-nam-giao',
    // Nam Giao Esplanade ceremony / Nha nhac court music
    hero: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Nh%C3%A3_nh%E1%BA%A1c_cung_%C4%91%C3%ACnh_Hu%E1%BA%BF.JPG',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/f/f7/Festival_Hu%E1%BA%BF_2008-7.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/b/b2/Festival_Hu%E1%BA%BF_2008-14.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/4/46/Festival_Hu%E1%BA%BF.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/3a/Festival_Hu%E1%BA%BF_2008-2.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/c/cf/B%E1%BB%99_trang_ph%E1%BB%A5c_quan_h%E1%BB%8D_2.jpg',
    ],
  },
  // Da Nang
  {
    slug: 'diff-da-nang',
    // Da Nang Dragon Bridge — verified Wikimedia originals
    hero: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dragon_Bridge%2C_Da_Nang_at_night_-_20230819.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/C%E1%BA%A7u_R%E1%BB%93ng.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/6d/Dragon_Bridge_%2829780234267%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/77/Dragon_Bridge_07.jpg',
      // Hue Festival performances as filler
      'https://upload.wikimedia.org/wikipedia/commons/b/b2/Festival_Hu%E1%BA%BF_2008-14.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/f/f7/Festival_Hu%E1%BA%BF_2008-7.JPG',
    ],
  },
  {
    slug: 'le-hoi-cau-ngu-da-nang',
    // Cau Ngu fishing festival — use Dragon Bridge + festival imagery
    hero: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/C%E1%BA%A7u_R%E1%BB%93ng.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dragon_Bridge%2C_Da_Nang_at_night_-_20230819.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/6d/Dragon_Bridge_%2829780234267%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/77/Dragon_Bridge_07.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b2/Festival_Hu%E1%BA%BF_2008-14.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/8/80/Nh%C3%A3_nh%E1%BA%A1c_cung_%C4%91%C3%ACnh_Hu%E1%BA%BF.JPG',
    ],
  },
  {
    slug: 'le-te-ca-ong-da-nang',
    // Ca Ong whale festival Da Nang
    hero: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Dragon_Bridge_%2829780234267%29.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/C%E1%BA%A7u_R%E1%BB%93ng.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dragon_Bridge%2C_Da_Nang_at_night_-_20230819.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/77/Dragon_Bridge_07.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/46/Festival_Hu%E1%BA%BF.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/3a/Festival_Hu%E1%BA%BF_2008-2.JPG',
    ],
  },
  // Ha Giang
  {
    slug: 'le-hoi-khen-mong',
    // H'Mong khen reed pipe festival — verified Wikimedia originals
    hero: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/FlowerHmong_Vietnam_%28pixinn.net%29.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Wietnam%2C_Sapa%2C_Str%C3%B3j_ludowy_trzech_kobiet.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c1/Can_Cau_market_%286223927056%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/21/Trang_phuc_Lo_Lo.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ha_Giang_Vietnam.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/%C4%90%C3%A8o_M%C3%A3_P%C3%AC_L%C3%A8ng.jpg',
    ],
  },
  {
    slug: 'le-hoi-hoa-tam-giac-mach',
    // Buckwheat flower festival — Ha Giang landscapes verified Wikimedia
    hero: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/%C4%90%C3%A8o_M%C3%A3_P%C3%AC_L%C3%A8ng.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ha_Giang_Vietnam.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/a/a2/Quanba.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/0c/Cao_nguy%C3%AAn_%C4%91%C3%A1.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tt._%C4%90%E1%BB%93ng_V%C4%83n%2C_%C4%90%E1%BB%93ng_V%C4%83n%2C_H%C3%A0_Giang%2C_Vietnam_-_panoramio_%281%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b5/FlowerHmong_Vietnam_%28pixinn.net%29.jpg',
    ],
  },
  {
    slug: 'cho-tinh-khau-vai',
    // Khau Vai love market — Ha Giang ethnic minority imagery
    hero: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Can_Cau_market_%286223927056%29.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Wietnam%2C_Sapa%2C_Str%C3%B3j_ludowy_trzech_kobiet.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b5/FlowerHmong_Vietnam_%28pixinn.net%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/21/Trang_phuc_Lo_Lo.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ha_Giang_Vietnam.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/0/0c/Cao_nguy%C3%AAn_%C4%91%C3%A1.JPG',
    ],
  },
  {
    slug: 'le-hoi-long-tong',
    // Long Tong spring festival — Ha Giang valley
    hero: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Quanba.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ha_Giang_Vietnam.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/%C4%90%C3%A8o_M%C3%A3_P%C3%AC_L%C3%A8ng.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/0c/Cao_nguy%C3%AAn_%C4%91%C3%A1.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Wietnam%2C_Sapa%2C_Str%C3%B3j_ludowy_trzech_kobiet.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/21/Trang_phuc_Lo_Lo.jpg',
    ],
  },
  {
    slug: 'le-hoi-gau-tao',
    // Gau Tao H'Mong spring festival
    hero: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Hmong_King%27s_house_at_SaPhin.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/7/79/SaPhin_HaGiang_Vietnam.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/b/b5/FlowerHmong_Vietnam_%28pixinn.net%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Wietnam%2C_Sapa%2C_Str%C3%B3j_ludowy_trzech_kobiet.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c1/Can_Cau_market_%286223927056%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ha_Giang_Vietnam.JPG',
    ],
  },
  {
    slug: 'le-nhay-lua-pa-then',
    // Pa Then fire dance — Ha Giang ethnic minority
    hero: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Trang_phuc_Lo_Lo.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b5/FlowerHmong_Vietnam_%28pixinn.net%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Wietnam%2C_Sapa%2C_Str%C3%B3j_ludowy_trzech_kobiet.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/63/Hmong_King%27s_house_at_SaPhin.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/79/SaPhin_HaGiang_Vietnam.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/0/0c/Cao_nguy%C3%AAn_%C4%91%C3%A1.JPG',
    ],
  },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function downloadFile(url: string, dest: string, retries = 3): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    // Use a descriptive User-Agent as required by Wikimedia API policy
    const headers = {
      'User-Agent': 'KhamPhaVietNam/1.0 (https://github.com/khamphaVN; dungtruongtien411@gmail.com) node-https/1.0',
    };

    const request = protocol.get(url, { headers }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location!;
        file.close();
        fs.unlink(dest, () => {});
        downloadFile(redirectUrl, dest, retries).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode === 429 && retries > 0) {
        // Rate limited — wait 5s and retry
        file.close();
        fs.unlink(dest, () => {});
        sleep(5000).then(() => downloadFile(url, dest, retries - 1)).then(resolve).catch(reject);
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
  for (const festival of festivals) {
    const dir = path.join('public', 'festivals', festival.slug);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`\n📦 ${festival.slug}`);

    // hero
    try {
      const ext = festival.hero.match(/\.(webp|jpg|jpeg|png|JPG|JPEG)/i)?.[1] ?? 'jpg';
      const normalExt = ext.toLowerCase() === 'webp' ? 'jpg' : ext.toLowerCase();
      const dest = path.join(dir, `hero.${normalExt}`);
      await downloadFile(festival.hero, dest);
      // Normalise to hero.jpg
      if (normalExt !== 'jpg') {
        const heroPath = path.join(dir, 'hero.jpg');
        if (!fs.existsSync(heroPath)) fs.renameSync(dest, heroPath);
      }
      console.log(`  ✓ hero`);
    } catch (e) {
      console.error(`  ✗ hero: ${e}`);
    }
    await sleep(1500); // 1.5s between each request to respect Wikimedia rate limits

    // gallery (5 items)
    for (let i = 0; i < festival.gallery.length; i++) {
      const url = festival.gallery[i];
      const n = i + 1;
      try {
        const dest = path.join(dir, `gallery-${n}.jpg`);
        await downloadFile(url, dest);
        console.log(`  ✓ gallery-${n}`);
      } catch (e) {
        console.error(`  ✗ gallery-${n}: ${e}`);
      }
      await sleep(1500);
    }
  }
  console.log('\n✅ Done');
}

main().catch(console.error);
