ALTER TABLE `education_contents` ADD `duration_minutes` int DEFAULT 8 NOT NULL;--> statement-breakpoint
UPDATE `education_contents` SET `duration_minutes` = CASE `slug`
  WHEN 'mulai-konten-30-hari' THEN 8
  WHEN 'catatan-keuangan-sederhana' THEN 42
  WHEN 'ai-untuk-umkm' THEN 55
  WHEN 'brand-yang-diingat' THEN 7
  WHEN 'izin-usaha-dasar' THEN 12
  WHEN 'sop-pesanan' THEN 15
  WHEN 'pelanggan-kembali' THEN 60
  WHEN 'harga-jual-sehat' THEN 10
  ELSE `duration_minutes`
END;--> statement-breakpoint
ALTER TABLE `service_packages` ADD `original_price` int;--> statement-breakpoint
UPDATE `service_packages` SET `original_price` = CASE `slug`
  WHEN 'starter-profile' THEN 1750000
  WHEN 'market-ready-kit' THEN 3500000
  WHEN 'fund-pitch-ready' THEN 6500000
  WHEN 'website-company-profile' THEN 3500000
  WHEN 'web-commerce-nade' THEN 499000
  ELSE NULL
END;--> statement-breakpoint
INSERT INTO `product_member_prices` (`product_id`, `price`)
SELECT p.`id`, CASE p.`slug`
  WHEN 'kasir-pintar-pos' THEN 99000
  WHEN 'kemasan-kraft-premium' THEN 235000
  WHEN 'printer-label-bluetooth' THEN 599000
  WHEN 'buku-kas-digital' THEN 349000
  WHEN 'foto-produk-mini-studio' THEN 375000
  WHEN 'paket-pengiriman-hemat' THEN 199000
  WHEN 'izin-usaha-plus' THEN 775000
  WHEN 'wa-customer-manager' THEN 219000
  WHEN 'label-stiker-custom' THEN 145000
  WHEN 'rak-display-modular' THEN 675000
END
FROM `products` p
WHERE p.`slug` IN (
  'kasir-pintar-pos', 'kemasan-kraft-premium', 'printer-label-bluetooth',
  'buku-kas-digital', 'foto-produk-mini-studio', 'paket-pengiriman-hemat',
  'izin-usaha-plus', 'wa-customer-manager', 'label-stiker-custom', 'rak-display-modular'
)
AND NOT EXISTS (
  SELECT 1 FROM `product_member_prices` mp WHERE mp.`product_id` = p.`id`
);
