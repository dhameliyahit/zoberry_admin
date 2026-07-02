/**
 * Product Catalog Generator — Creates 700+ products for Zoberry Enterprise
 *
 * Usage: node scripts/generate-catalog.js
 * Output: scripts/product-catalog.js (overwritten with full catalog)
 */

const fs = require("fs");
const path = require("path");

let idCounter = 0;
function nextId() {
  return String(++idCounter);
}

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══════════════════════════════════════════════════════════════════
// BASE PRODUCT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

const TV_SIZES = ["32-inch", "40-inch", "43-inch", "50-inch", "55-inch", "65-inch", "75-inch", "85-inch"];
const TV_BRANDS = [
  { name: "Samsung", models: ["Crystal 4K UHD", "Neo QLED", "The Frame", "OLED", "QLED", "Smart LED"] },
  { name: "LG", models: ["4K UHD", "OLED C3", "OLED G3", "NanoCell", "Smart LED", "QNED"] },
  { name: "Sony", models: ["Bravia 4K LED", "Bravia XR OLED", "Bravia X90L", "Bravia X80L", "Bravia KD"] },
  { name: "TCL", models: ["4K QLED", "Full HD Smart", "Google TV", "Android TV", "LED"] },
  { name: "Xiaomi", models: ["4K Ultra HD", "Smart LED", "Mi TV", "Fire TV", "Android TV"] },
  { name: "Hisense", models: ["4K UHD", "Laser TV", "VIDAA", "Smart LED"] },
  { name: "OnePlus", models: ["Y Series", "U Series", "Q Series", "LED Smart"] },
  { name: "Vu", models: ["4K Smart TV", "Premium LED", "GloLED", "Cinema TV"] },
  { name: "iFFALCON", models: ["4K UHD", "K61", "Smart LED"] },
  { name: "Nokia", models: ["4K Smart TV", "Android TV", "LED TV"] },
];

const LAPTOP_BRANDS = [
  { name: "Apple", lines: [
    { model: "MacBook Air M1", basePrice: 99900, discount: 84900, variants: ["8/256GB", "8/512GB", "16/256GB", "16/512GB"] },
    { model: "MacBook Air M2", basePrice: 119900, discount: 104900, variants: ["8/256GB", "8/512GB", "16/256GB", "16/512GB", "24/512GB"] },
    { model: "MacBook Pro M2", basePrice: 129900, discount: 114900, variants: ["8/256GB", "8/512GB", "16/512GB", "16/1TB"] },
    { model: "MacBook Pro M3", basePrice: 149900, discount: 134900, variants: ["8/512GB", "16/512GB", "16/1TB", "24/1TB"] },
    { model: "MacBook Pro M3 Pro", basePrice: 199900, discount: 179900, variants: ["18/512GB", "18/1TB", "36/1TB"] },
    { model: "MacBook Pro M3 Max", basePrice: 349900, discount: 319900, variants: ["36/1TB", "48/1TB", "48/2TB"] },
    { model: "iMac M1 24-inch", basePrice: 129900, discount: 114900, variants: ["8/256GB", "8/512GB", "16/512GB", "16/1TB"] },
    { model: "iMac M3 24-inch", basePrice: 149900, discount: 134900, variants: ["8/256GB", "8/512GB", "24/1TB"] },
  ]},
  { name: "HP", lines: [
    { model: "HP 15s", basePrice: 42999, discount: 36999, variants: ["i3/8GB/256GB", "i5/8GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB", "i7/16GB/1TB"] },
    { model: "HP Pavilion 14", basePrice: 54999, discount: 47999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB", "i7/16GB/1TB"] },
    { model: "HP Pavilion 15", basePrice: 52999, discount: 45999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB", "i7/16GB/1TB"] },
    { model: "HP Victus 15", basePrice: 62999, discount: 54999, variants: ["R5/8GB/512GB", "R5/16GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "HP Omen 16", basePrice: 89999, discount: 79999, variants: ["R7/16GB/512GB", "i7/16GB/512GB", "i7/32GB/1TB", "i9/32GB/1TB"] },
    { model: "HP Envy x360", basePrice: 72999, discount: 64999, variants: ["R5/8GB/512GB", "R7/16GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "HP ProBook 450", basePrice: 49999, discount: 42999, variants: ["i5/8GB/256GB", "i5/8GB/512GB", "i7/16GB/512GB"] },
    { model: "HP EliteBook 840", basePrice: 99999, discount: 89999, variants: ["i5/16GB/512GB", "i7/16GB/512GB", "i7/32GB/1TB"] },
  ]},
  { name: "Dell", lines: [
    { model: "Dell Inspiron 15", basePrice: 44999, discount: 38999, variants: ["i3/8GB/256GB", "i5/8GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "Dell Inspiron 14", basePrice: 49999, discount: 42999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "Dell Vostro 15", basePrice: 42999, discount: 36999, variants: ["i3/8GB/256GB", "i5/8GB/512GB", "i5/16GB/512GB"] },
    { model: "Dell Latitude 5540", basePrice: 74999, discount: 64999, variants: ["i5/8GB/256GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "Dell XPS 13", basePrice: 109999, discount: 99999, variants: ["i5/8GB/512GB", "i7/16GB/512GB", "i7/16GB/1TB", "i7/32GB/1TB"] },
    { model: "Dell XPS 15", basePrice: 149999, discount: 134999, variants: ["i7/16GB/512GB", "i7/32GB/1TB", "i9/32GB/1TB", "i9/64GB/2TB"] },
    { model: "Dell G15 Gaming", basePrice: 69999, discount: 59999, variants: ["R5/8GB/512GB", "R7/16GB/512GB", "i5/16GB/512GB", "i7/16GB/1TB"] },
    { model: "Dell Alienware m16", basePrice: 179999, discount: 159999, variants: ["i7/16GB/1TB", "i9/32GB/1TB", "i9/32GB/2TB"] },
  ]},
  { name: "Lenovo", lines: [
    { model: "Lenovo IdeaPad 3", basePrice: 39999, discount: 34999, variants: ["i3/8GB/256GB", "i5/8GB/512GB", "R5/8GB/512GB", "R5/16GB/512GB"] },
    { model: "Lenovo IdeaPad Slim 5", basePrice: 54999, discount: 47999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "Lenovo ThinkPad E14", basePrice: 49999, discount: 42999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "Lenovo ThinkPad X1 Carbon", basePrice: 149999, discount: 129999, variants: ["i5/16GB/512GB", "i7/16GB/1TB", "i7/32GB/1TB"] },
    { model: "Lenovo Legion 5", basePrice: 79999, discount: 69999, variants: ["R5/16GB/512GB", "R7/16GB/512GB", "R7/32GB/1TB", "i7/16GB/1TB"] },
    { model: "Lenovo Legion Pro 5", basePrice: 129999, discount: 114999, variants: ["R7/16GB/1TB", "R9/32GB/1TB", "i9/32GB/1TB"] },
    { model: "Lenovo LOQ 15", basePrice: 59999, discount: 52999, variants: ["R5/8GB/512GB", "R5/16GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "Lenovo Yoga 9i", basePrice: 139999, discount: 119999, variants: ["i7/16GB/512GB", "i7/16GB/1TB", "i7/32GB/1TB"] },
  ]},
  { name: "Asus", lines: [
    { model: "Asus VivoBook 14", basePrice: 42999, discount: 36999, variants: ["i3/8GB/256GB", "i5/8GB/512GB", "i5/16GB/512GB", "R5/8GB/512GB"] },
    { model: "Asus VivoBook 15", basePrice: 44999, discount: 38999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "R5/8GB/512GB", "R7/16GB/512GB"] },
    { model: "Asus ZenBook 14", basePrice: 79999, discount: 69999, variants: ["i5/16GB/512GB", "i7/16GB/512GB", "i7/16GB/1TB", "R7/16GB/512GB"] },
    { model: "Asus ROG Strix G15", basePrice: 89999, discount: 79999, variants: ["R7/16GB/512GB", "R9/16GB/1TB", "R9/32GB/1TB", "i7/16GB/1TB"] },
    { model: "Asus ROG Strix G16", basePrice: 109999, discount: 94999, variants: ["i7/16GB/512GB", "i7/16GB/1TB", "i9/16GB/1TB", "i9/32GB/1TB"] },
    { model: "Asus TUF Gaming A15", basePrice: 64999, discount: 56999, variants: ["R5/8GB/512GB", "R7/16GB/512GB", "R7/16GB/1TB"] },
    { model: "Asus TUF Gaming A16", basePrice: 74999, discount: 64999, variants: ["R7/16GB/512GB", "R9/16GB/1TB"] },
    { model: "Asus ProArt Studiobook", basePrice: 169999, discount: 149999, variants: ["i7/32GB/1TB", "i9/32GB/1TB", "i9/64GB/2TB"] },
  ]},
  { name: "Acer", lines: [
    { model: "Acer Aspire Lite", basePrice: 34999, discount: 29999, variants: ["i3/8GB/256GB", "i5/8GB/512GB", "R5/8GB/512GB"] },
    { model: "Acer Aspire 5", basePrice: 49999, discount: 42999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB", "R5/8GB/512GB"] },
    { model: "Acer Swift 3", basePrice: 54999, discount: 47999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "R5/8GB/512GB"] },
    { model: "Acer Nitro V 15", basePrice: 64999, discount: 56999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "R5/16GB/512GB", "R7/16GB/512GB"] },
    { model: "Acer Nitro 5", basePrice: 74999, discount: 64999, variants: ["R5/16GB/512GB", "R7/16GB/512GB", "i5/16GB/512GB", "i7/16GB/512GB"] },
    { model: "Acer Predator Helios 16", basePrice: 129999, discount: 114999, variants: ["i7/16GB/1TB", "i9/16GB/1TB", "i9/32GB/1TB", "i9/32GB/2TB"] },
  ]},
  { name: "MSI", lines: [
    { model: "MSI Modern 14", basePrice: 44999, discount: 38999, variants: ["i5/8GB/512GB", "i5/16GB/512GB", "R5/8GB/512GB"] },
    { model: "MSI Katana 15", basePrice: 69999, discount: 59999, variants: ["i5/16GB/512GB", "i7/16GB/512GB", "i7/16GB/1TB"] },
    { model: "MSI Pulse 15", basePrice: 84999, discount: 74999, variants: ["i7/16GB/512GB", "i7/16GB/1TB", "i9/32GB/1TB"] },
    { model: "MSI Raider GE78", basePrice: 199999, discount: 179999, variants: ["i9/32GB/1TB", "i9/64GB/2TB"] },
  ]},
];

const MOBILE_BRANDS = [
  { name: "Apple", models: [
    { model: "iPhone 13", basePrice: 64900, discount: 54900, variants: ["128GB", "256GB"] },
    { model: "iPhone 14", basePrice: 69900, discount: 59900, variants: ["128GB", "256GB", "512GB"] },
    { model: "iPhone 14 Plus", basePrice: 79900, discount: 69900, variants: ["128GB", "256GB", "512GB"] },
    { model: "iPhone 15", basePrice: 79900, discount: 72900, variants: ["128GB", "256GB", "512GB"] },
    { model: "iPhone 15 Plus", basePrice: 89900, discount: 82900, variants: ["128GB", "256GB", "512GB"] },
    { model: "iPhone 15 Pro", basePrice: 134900, discount: 124900, variants: ["128GB", "256GB", "512GB", "1TB"] },
    { model: "iPhone 15 Pro Max", basePrice: 159900, discount: 149900, variants: ["256GB", "512GB", "1TB"] },
  ]},
  { name: "Samsung", models: [
    { model: "Galaxy S23 FE", basePrice: 49999, discount: 39999, variants: ["128GB", "256GB"] },
    { model: "Galaxy S24", basePrice: 74999, discount: 64999, variants: ["128GB", "256GB"] },
    { model: "Galaxy S24+", basePrice: 99999, discount: 89999, variants: ["256GB", "512GB"] },
    { model: "Galaxy S24 Ultra", basePrice: 134999, discount: 124999, variants: ["256GB", "512GB", "1TB"] },
    { model: "Galaxy A15", basePrice: 18999, discount: 15999, variants: ["128GB", "256GB"] },
    { model: "Galaxy A25", basePrice: 22999, discount: 19999, variants: ["128GB", "256GB"] },
    { model: "Galaxy A35", basePrice: 29999, discount: 26999, variants: ["128GB", "256GB"] },
    { model: "Galaxy A54", basePrice: 38999, discount: 32999, variants: ["128GB", "256GB"] },
    { model: "Galaxy A55", basePrice: 39999, discount: 34999, variants: ["128GB", "256GB"] },
    { model: "Galaxy M14", basePrice: 15999, discount: 13999, variants: ["64GB", "128GB"] },
    { model: "Galaxy M34", basePrice: 18999, discount: 16999, variants: ["128GB", "256GB"] },
    { model: "Galaxy M54", basePrice: 29999, discount: 26999, variants: ["128GB", "256GB"] },
  ]},
  { name: "OnePlus", models: [
    { model: "OnePlus 12", basePrice: 69999, discount: 64999, variants: ["256GB", "512GB"] },
    { model: "OnePlus 11", basePrice: 56999, discount: 49999, variants: ["128GB", "256GB"] },
    { model: "OnePlus Nord CE4", basePrice: 26999, discount: 24999, variants: ["128GB", "256GB"] },
    { model: "OnePlus Nord 3", basePrice: 33999, discount: 29999, variants: ["128GB", "256GB"] },
    { model: "OnePlus Nord CE3", basePrice: 22999, discount: 19999, variants: ["128GB", "256GB"] },
    { model: "OnePlus Nord N30", basePrice: 17999, discount: 15999, variants: ["128GB"] },
  ]},
  { name: "Xiaomi", models: [
    { model: "Xiaomi 14", basePrice: 69999, discount: 62999, variants: ["256GB", "512GB"] },
    { model: "Xiaomi 13T", basePrice: 44999, discount: 39999, variants: ["128GB", "256GB"] },
    { model: "Redmi Note 13 Pro+", basePrice: 32999, discount: 29999, variants: ["256GB", "512GB"] },
    { model: "Redmi Note 13 Pro", basePrice: 24999, discount: 21999, variants: ["128GB", "256GB"] },
    { model: "Redmi Note 13", basePrice: 16999, discount: 14999, variants: ["128GB", "256GB"] },
    { model: "Redmi 13", basePrice: 11999, discount: 10999, variants: ["64GB", "128GB"] },
    { model: "Redmi 12", basePrice: 9999, discount: 8999, variants: ["64GB", "128GB"] },
    { model: "Poco X6 Pro", basePrice: 29999, discount: 26999, variants: ["256GB", "512GB"] },
    { model: "Poco X6", basePrice: 21999, discount: 19999, variants: ["128GB", "256GB"] },
    { model: "Poco M6 Pro", basePrice: 13999, discount: 11999, variants: ["64GB", "128GB"] },
  ]},
  { name: "Google", models: [
    { model: "Pixel 8", basePrice: 75999, discount: 69999, variants: ["128GB", "256GB"] },
    { model: "Pixel 8 Pro", basePrice: 106999, discount: 96999, variants: ["128GB", "256GB", "512GB"] },
    { model: "Pixel 7a", basePrice: 43999, discount: 37999, variants: ["128GB"] },
  ]},
  { name: "Realme", models: [
    { model: "Realme GT 5 Pro", basePrice: 39999, discount: 34999, variants: ["256GB", "512GB"] },
    { model: "Realme 12 Pro+", basePrice: 29999, discount: 26999, variants: ["128GB", "256GB"] },
    { model: "Realme 12 Pro", basePrice: 25999, discount: 22999, variants: ["128GB", "256GB"] },
    { model: "Realme 12", basePrice: 17999, discount: 15999, variants: ["128GB", "256GB"] },
    { model: "Realme Narzo 70x", basePrice: 13999, discount: 11999, variants: ["128GB"] },
    { model: "Realme C67", basePrice: 10999, discount: 9999, variants: ["64GB", "128GB"] },
  ]},
  { name: "Vivo", models: [
    { model: "Vivo X100", basePrice: 69999, discount: 64999, variants: ["256GB", "512GB"] },
    { model: "Vivo V30", basePrice: 33999, discount: 29999, variants: ["128GB", "256GB"] },
    { model: "Vivo V30 Pro", basePrice: 41999, discount: 36999, variants: ["256GB", "512GB"] },
    { model: "Vivo T3", basePrice: 19999, discount: 17999, variants: ["128GB", "256GB"] },
    { model: "Vivo Y28", basePrice: 13999, discount: 11999, variants: ["64GB", "128GB"] },
  ]},
  { name: "Oppo", models: [
    { model: "Oppo Find X7", basePrice: 69999, discount: 64999, variants: ["256GB", "512GB"] },
    { model: "Oppo Reno 11", basePrice: 32999, discount: 28999, variants: ["128GB", "256GB"] },
    { model: "Oppo Reno 11F", basePrice: 23999, discount: 20999, variants: ["128GB", "256GB"] },
    { model: "Oppo A38", basePrice: 12999, discount: 10999, variants: ["64GB", "128GB"] },
    { model: "Oppo A78", basePrice: 17999, discount: 15999, variants: ["128GB", "256GB"] },
  ]},
  { name: "Nothing", models: [
    { model: "Nothing Phone (2a)", basePrice: 23999, discount: 21999, variants: ["128GB", "256GB"] },
    { model: "Nothing Phone (2)", basePrice: 44999, discount: 39999, variants: ["128GB", "256GB", "512GB"] },
  ]},
  { name: "Motorola", models: [
    { model: "Moto Edge 50 Pro", basePrice: 35999, discount: 31999, variants: ["256GB"] },
    { model: "Moto Edge 50 Fusion", basePrice: 22999, discount: 19999, variants: ["128GB", "256GB"] },
    { model: "Moto G84", basePrice: 19999, discount: 16999, variants: ["128GB", "256GB"] },
    { model: "Moto G54", basePrice: 15999, discount: 13999, variants: ["128GB", "256GB"] },
    { model: "Moto G34", basePrice: 11999, discount: 10999, variants: ["64GB", "128GB"] },
  ]},
];

const TABLET_BRANDS = [
  { name: "Apple", models: [
    { model: "iPad 10th Gen", basePrice: 44900, discount: 39900, variants: ["64GB WiFi", "256GB WiFi", "64GB WiFi+Cell", "256GB WiFi+Cell"] },
    { model: "iPad Air 5th Gen", basePrice: 54900, discount: 47900, variants: ["64GB WiFi", "256GB WiFi", "64GB WiFi+Cell", "256GB WiFi+Cell"] },
    { model: "iPad Pro M2 11-inch", basePrice: 81900, discount: 74900, variants: ["128GB", "256GB", "512GB", "1TB", "2TB"] },
    { model: "iPad Pro M2 12.9-inch", basePrice: 109900, discount: 99900, variants: ["128GB", "256GB", "512GB", "1TB", "2TB"] },
    { model: "iPad mini 6th Gen", basePrice: 49900, discount: 44900, variants: ["64GB WiFi", "256GB WiFi", "64GB WiFi+Cell", "256GB WiFi+Cell"] },
  ]},
  { name: "Samsung", models: [
    { model: "Galaxy Tab S9 FE", basePrice: 44999, discount: 37999, variants: ["128GB WiFi", "256GB WiFi", "128GB WiFi+5G", "256GB WiFi+5G"] },
    { model: "Galaxy Tab S9", basePrice: 74999, discount: 64999, variants: ["128GB", "256GB", "512GB"] },
    { model: "Galaxy Tab S9+", basePrice: 99999, discount: 89999, variants: ["256GB", "512GB"] },
    { model: "Galaxy Tab A9", basePrice: 17999, discount: 14999, variants: ["64GB WiFi", "128GB WiFi", "64GB WiFi+4G", "128GB WiFi+4G"] },
    { model: "Galaxy Tab A9+", basePrice: 26999, discount: 22999, variants: ["64GB", "128GB", "256GB"] },
  ]},
  { name: "Lenovo", models: [
    { model: "Lenovo Tab P12", basePrice: 34999, discount: 29999, variants: ["128GB WiFi", "256GB WiFi"] },
    { model: "Lenovo Tab M11", basePrice: 22999, discount: 19999, variants: ["64GB WiFi", "128GB WiFi"] },
    { model: "Lenovo Tab M10 Plus", basePrice: 17999, discount: 14999, variants: ["64GB WiFi", "128GB WiFi"] },
  ]},
  { name: "OnePlus", models: [
    { model: "OnePlus Pad", basePrice: 37999, discount: 32999, variants: ["128GB", "256GB"] },
    { model: "OnePlus Pad Go", basePrice: 19999, discount: 17999, variants: ["128GB WiFi", "256GB WiFi"] },
  ]},
  { name: "Xiaomi", models: [
    { model: "Xiaomi Pad 6", basePrice: 29999, discount: 26999, variants: ["128GB", "256GB"] },
    { model: "Redmi Pad SE", basePrice: 13999, discount: 11999, variants: ["64GB", "128GB", "256GB"] },
  ]},
  { name: "Realme", models: [
    { model: "Realme Pad 2", basePrice: 19999, discount: 16999, variants: ["64GB", "128GB", "256GB"] },
    { model: "Realme Pad Mini", basePrice: 12999, discount: 10999, variants: ["32GB", "64GB"] },
  ]},
];

const AUDIO_HEADPHONES = [
  { brand: "Sony", model: "WH-1000XM5", base: 29990, disc: 24990 },
  { brand: "Sony", model: "WH-1000XM4", base: 24990, disc: 19990 },
  { brand: "Sony", model: "WH-CH720N", base: 9990, disc: 7990 },
  { brand: "Sony", model: "WH-CH520", base: 5990, disc: 4490 },
  { brand: "Bose", model: "QuietComfort Ultra", base: 34900, disc: 29900 },
  { brand: "Bose", model: "QuietComfort 45", base: 27900, disc: 22900 },
  { brand: "Bose", model: "Solo 45", base: 17900, disc: 14900 },
  { brand: "Sennheiser", model: "HD 450BT", base: 14990, disc: 11990 },
  { brand: "Sennheiser", model: "Momentum 4", base: 29990, disc: 24990 },
  { brand: "Sennheiser", model: "HD 560S", base: 12990, disc: 10990 },
  { brand: "JBL", model: "Tune 770NC", base: 7999, disc: 5999 },
  { brand: "JBL", model: "Live 670NC", base: 9999, disc: 7999 },
  { brand: "JBL", model: "Tune 520BT", base: 3999, disc: 2999 },
  { brand: "boAt", model: "Rockerz 550", base: 1799, disc: 1299 },
  { brand: "boAt", model: "Rockerz 450", base: 1499, disc: 999 },
  { brand: "boAt", model: "Rockerz 510", base: 1999, disc: 1499 },
  { brand: "Audio-Technica", model: "ATH-M50x", base: 14990, disc: 12990 },
  { brand: "Audio-Technica", model: "ATH-M20x", base: 5990, disc: 4990 },
  { brand: "Skullcandy", model: "Crusher ANC 2", base: 9999, disc: 7999 },
  { brand: "Skullcandy", model: "Hesh ANC", base: 7999, disc: 5999 },
];

const AUDIO_EARBUDS = [
  { brand: "Apple", model: "AirPods Pro 2", base: 24900, disc: 22900 },
  { brand: "Apple", model: "AirPods 3", base: 18900, disc: 16900 },
  { brand: "Apple", model: "AirPods 2", base: 12900, disc: 11900 },
  { brand: "Apple", model: "AirPods Max", base: 59900, disc: 54900 },
  { brand: "Samsung", model: "Galaxy Buds2 Pro", base: 17999, disc: 12999 },
  { brand: "Samsung", model: "Galaxy Buds FE", base: 9999, disc: 7999 },
  { brand: "Samsung", model: "Galaxy Buds2", base: 13999, disc: 10999 },
  { brand: "Sony", model: "WF-1000XM5", base: 24990, disc: 21990 },
  { brand: "Sony", model: "WF-1000XM4", base: 19990, disc: 16990 },
  { brand: "Sony", model: "WF-C700N", base: 9990, disc: 7990 },
  { brand: "JBL", model: "Tune 230NC TWS", base: 5999, disc: 4499 },
  { brand: "JBL", model: "Live Pro 2", base: 12999, disc: 9999 },
  { brand: "JBL", model: "Wave Beam", base: 3999, disc: 2999 },
  { brand: "JBL", model: "Wave Buds", base: 2999, disc: 2299 },
  { brand: "boAt", model: "Airdopes 141", base: 1299, disc: 899 },
  { brand: "boAt", model: "Airdopes 161", base: 1499, disc: 1099 },
  { brand: "boAt", model: "Airdopes 411 ANC", base: 2999, disc: 1999 },
  { brand: "boAt", model: "Airdopes 131", base: 899, disc: 599 },
  { brand: "Nothing", model: "Ear 2", base: 9999, disc: 7999 },
  { brand: "Nothing", model: "Ear (a)", base: 4999, disc: 3999 },
  { brand: "Realme", model: "Buds Air 5 Pro", base: 4999, disc: 3999 },
  { brand: "Realme", model: "Buds T300", base: 2499, disc: 1999 },
  { brand: "OnePlus", model: "Buds Pro 2", base: 9999, disc: 7999 },
  { brand: "OnePlus", model: "Nord Buds 2r", base: 2299, disc: 1799 },
  { brand: "Sennheiser", model: "Momentum TW4", base: 24990, disc: 21990 },
  { brand: "Sennheiser", model: "CX Plus", base: 9990, disc: 7990 },
  { brand: "Skullcandy", model: "Sesh ANC", base: 5999, disc: 4499 },
  { brand: "Amazfit", model: "Buds T1", base: 1999, disc: 1499 },
];

const AUDIO_SPEAKERS = [
  { brand: "JBL", model: "Flip 6", base: 12999, disc: 9999 },
  { brand: "JBL", model: "Charge 5", base: 17999, disc: 14999 },
  { brand: "JBL", model: "Go 3", base: 3999, disc: 2999 },
  { brand: "JBL", model: "Clip 4", base: 4999, disc: 3999 },
  { brand: "JBL", model: "PartyBox 310", base: 34999, disc: 29999 },
  { brand: "JBL", model: "Bar 2.1", base: 24999, disc: 19999 },
  { brand: "JBL", model: "Bar 5.1", base: 49999, disc: 42999 },
  { brand: "Marshall", model: "Emberton II", base: 16999, disc: 14999 },
  { brand: "Marshall", model: "Stanmore III", base: 34999, disc: 29999 },
  { brand: "Marshall", model: "Acton III", base: 24999, disc: 21999 },
  { brand: "Sony", model: "SRS-XB100", base: 4990, disc: 3990 },
  { brand: "Sony", model: "SRS-XB33", base: 12990, disc: 9990 },
  { brand: "Sony", model: "SRS-XG300", base: 19990, disc: 16990 },
  { brand: "Bose", model: "SoundLink Flex", base: 13900, disc: 11900 },
  { brand: "Bose", model: "SoundLink Max", base: 29900, disc: 24900 },
  { brand: "Ultimate Ears", model: "BOOM 3", base: 14999, disc: 11999 },
  { brand: "Ultimate Ears", model: "MEGABOOM 3", base: 19999, disc: 16999 },
  { brand: "Ultimate Ears", model: "Wonderboom 3", base: 9999, disc: 7999 },
  { brand: "Sonos", model: "Roam", base: 16900, disc: 14900 },
  { brand: "Sonos", model: "Move 2", base: 44900, disc: 39900 },
  { brand: "boAt", model: "Stone 1200", base: 5999, disc: 4499 },
  { brand: "boAt", model: "Stone 350", base: 2999, disc: 2299 },
  { brand: "boAt", model: "Rockerz 333", base: 1499, disc: 1099 },
  { brand: "Mi", model: "Portable Bluetooth Speaker", base: 2999, disc: 2299 },
  { brand: "Bang & Olufsen", model: "Beosound Explore", base: 21990, disc: 19990 },
  { brand: "Bang & Olufsen", model: "Beolit 20", base: 64990, disc: 59990 },
];

const GAMING_PRODUCTS = [
  { brand: "Sony", model: "PlayStation 5 Console", base: 54990, disc: 49990 },
  { brand: "Sony", model: "PS5 Digital Edition", base: 44990, disc: 39990 },
  { brand: "Sony", model: "PS5 DualSense Controller - White", base: 6390, disc: 5490 },
  { brand: "Sony", model: "PS5 DualSense Controller - Midnight Black", base: 6390, disc: 5490 },
  { brand: "Sony", model: "PS5 DualSense Edge", base: 18990, disc: 16990 },
  { brand: "Sony", model: "PS5 Pulse 3D Headset", base: 8990, disc: 7490 },
  { brand: "Microsoft", model: "Xbox Series S", base: 37999, disc: 34999 },
  { brand: "Microsoft", model: "Xbox Series X", base: 54999, disc: 49999 },
  { brand: "Microsoft", model: "Xbox Wireless Controller - Carbon Black", base: 5999, disc: 4999 },
  { brand: "Microsoft", model: "Xbox Elite Series 2 Controller", base: 17999, disc: 15999 },
  { brand: "Nintendo", model: "Switch OLED Model", base: 37999, disc: 34999 },
  { brand: "Nintendo", model: "Switch Lite", base: 19999, disc: 17999 },
  { brand: "Nintendo", model: "Switch Pro Controller", base: 6999, disc: 5999 },
  { brand: "Logitech", model: "G502 HERO Gaming Mouse", base: 5495, disc: 4295 },
  { brand: "Logitech", model: "G Pro X Superlight Mouse", base: 14995, disc: 12995 },
  { brand: "Logitech", model: "G915 TKL Keyboard", base: 19995, disc: 16995 },
  { brand: "Logitech", model: "G435 Gaming Headset", base: 7995, disc: 5995 },
  { brand: "Razer", model: "BlackWidow V3 Keyboard", base: 12999, disc: 9999 },
  { brand: "Razer", model: "DeathAdder V3 Mouse", base: 8999, disc: 7499 },
  { brand: "Razer", model: "Kraken V3 Headset", base: 9999, disc: 7999 },
  { brand: "HyperX", model: "Cloud II Headset", base: 9999, disc: 7999 },
  { brand: "HyperX", model: "Alloy Origins Keyboard", base: 12999, disc: 9999 },
  { brand: "HyperX", model: "Pulsefire Haste Mouse", base: 5999, disc: 4499 },
  { brand: "Corsair", model: "K70 RGB Keyboard", base: 14999, disc: 12999 },
  { brand: "Corsair", model: "M65 RGB Ultra Mouse", base: 7999, disc: 6499 },
  { brand: "Corsair", model: "Virtuoso RGB Headset", base: 19999, disc: 16999 },
  { brand: "Havit", model: "HV-G69 USB Gamepad", base: 1499, disc: 899 },
  { brand: "Cosmic Byte", model: "Blaze Gamepad", base: 1299, disc: 799 },
  { brand: "Cosmic Byte", model: "G4000 Gaming Headset", base: 1999, disc: 1499 },
  { brand: "Redgear", model: "Pro Wireless Gamepad", base: 1799, disc: 1299 },
];

const CAMERA_PRODUCTS = [
  { brand: "Canon", model: "EOS M50 Mark II", base: 64995, disc: 58995 },
  { brand: "Canon", model: "EOS R50", base: 74995, disc: 68995 },
  { brand: "Canon", model: "EOS R10", base: 89995, disc: 82995 },
  { brand: "Canon", model: "EOS 200D II", base: 54995, disc: 49995 },
  { brand: "Sony", model: "Alpha ZV-E10", base: 59990, disc: 54990 },
  { brand: "Sony", model: "Alpha 6400", base: 74990, disc: 67990 },
  { brand: "Sony", model: "Alpha 7C II", base: 169990, disc: 154990 },
  { brand: "Nikon", model: "Z50 Kit", base: 74995, disc: 68995 },
  { brand: "Nikon", model: "Z30 Kit", base: 64995, disc: 59995 },
  { brand: "Fujifilm", model: "X-T30 II", base: 84999, disc: 78999 },
  { brand: "Fujifilm", model: "X-S10 Kit", base: 94999, disc: 86999 },
  { brand: "GoPro", model: "Hero 12 Black", base: 41500, disc: 37500 },
  { brand: "GoPro", model: "Hero 11 Black", base: 36500, disc: 32500 },
  { brand: "DJI", model: "Mini 4K Drone", base: 34999, disc: 29999 },
  { brand: "DJI", model: "Air 3 Drone", base: 109999, disc: 99999 },
  { brand: "DJI", model: "Osmo Action 4", base: 32999, disc: 29999 },
  { brand: "Insta360", model: "Go 3S", base: 33999, disc: 29999 },
  { brand: "Insta360", model: "X3", base: 41999, disc: 37999 },
];

const HOME_APPLIANCES = [
  { brand: "Prestige", model: "Induction Cooktop 2000W", base: 3499, disc: 2499 },
  { brand: "Prestige", model: "Induction Cooktop 1600W", base: 2799, disc: 1999 },
  { brand: "Prestige", model: "Pressure Cooker 5L", base: 3299, disc: 2499 },
  { brand: "Prestige", model: "Mixer Grinder 750W", base: 3999, disc: 2999 },
  { brand: "Prestige", model: "Hand Blender 250W", base: 1999, disc: 1499 },
  { brand: "Bajaj", model: "Majesty SWX 3 Sandwich Toaster", base: 1499, disc: 999 },
  { brand: "Bajaj", model: "Electrical Iron 1000W", base: 1299, disc: 899 },
  { brand: "Bajaj", model: "DX 11 Hair Dryer", base: 1499, disc: 1099 },
  { brand: "Bajaj", model: "Water Purifier 20L", base: 8999, disc: 7499 },
  { brand: "Philips", model: "Air Fryer HD9200/90", base: 9995, disc: 7495 },
  { brand: "Philips", model: "Air Fryer HD9252/90", base: 12995, disc: 9995 },
  { brand: "Philips", model: "Steam Iron 2200W", base: 2999, disc: 2299 },
  { brand: "Philips", model: "Mixer Grinder 750W", base: 4999, disc: 3999 },
  { brand: "Philips", model: "Room Heater 2000W", base: 2499, disc: 1999 },
  { brand: "Havells", model: "Instanio Prime 25L Water Heater", base: 12999, disc: 9999 },
  { brand: "Havells", model: "Instanio Prime 15L Water Heater", base: 9999, disc: 7999 },
  { brand: "Havells", model: "Adonia Digital Water Heater 25L", base: 16999, disc: 13999 },
  { brand: "Havells", model: "Cristallo i-Touch Room Heater", base: 3999, disc: 2999 },
  { brand: "Kent", model: "Pearl RO+UV+UF 8L", base: 19999, disc: 15999 },
  { brand: "Kent", model: "Pearl RO+UF 8L", base: 15999, disc: 12999 },
  { brand: "Kent", model: "Pristine Plus RO 8L", base: 17999, disc: 14999 },
  { brand: "Kent", model: "Ace Plus RO 8L", base: 14999, disc: 11999 },
  { brand: "IFB", model: "6.5kg 5 Star Front Load Washing Machine", base: 29990, disc: 24990 },
  { brand: "IFB", model: "7kg 5 Star Front Load Washing Machine", base: 34990, disc: 29990 },
  { brand: "IFB", model: "6.5kg 5 Star Top Load Washing Machine", base: 22990, disc: 19990 },
  { brand: "IFB", model: "8kg 5 Star Top Load Washing Machine", base: 27990, disc: 24990 },
  { brand: "LG", model: "190L 5 Star Direct-Cool Refrigerator", base: 18990, disc: 15990 },
  { brand: "LG", model: "260L 3 Star Double-Door Refrigerator", base: 26990, disc: 22990 },
  { brand: "LG", model: "343L 3 Star Double-Door Refrigerator", base: 34990, disc: 29990 },
  { brand: "LG", model: "668L Side-by-Side Refrigerator", base: 74990, disc: 64990 },
  { brand: "Samsung", model: "198L 5 Star Direct-Cool Refrigerator", base: 17990, disc: 14990 },
  { brand: "Samsung", model: "275L 3 Star Double-Door Refrigerator", base: 27990, disc: 23990 },
  { brand: "Samsung", model: "322L 3 Star Double-Door Refrigerator", base: 32990, disc: 27990 },
  { brand: "Samsung", model: "653L Side-by-Side Refrigerator", base: 69990, disc: 59990 },
  { brand: "Voltas", model: "1 Ton 3 Star Inverter Split AC", base: 32990, disc: 27990 },
  { brand: "Voltas", model: "1.5 Ton 3 Star Inverter Split AC", base: 38990, disc: 32990 },
  { brand: "Voltas", model: "1.5 Ton 5 Star Inverter Split AC", base: 44990, disc: 38990 },
  { brand: "Voltas", model: "2 Ton 3 Star Inverter Split AC", base: 48990, disc: 42990 },
  { brand: "Blue Star", model: "1 Ton 5 Star Inverter AC", base: 36990, disc: 30990 },
  { brand: "Blue Star", model: "1.5 Ton 5 Star Inverter AC", base: 44990, disc: 38990 },
  { brand: "Blue Star", model: "1 Ton 3 Star Inverter AC", base: 32990, disc: 27990 },
  { brand: "Daikin", model: "1.5 Ton 3 Star Inverter Split AC", base: 42990, disc: 36990 },
  { brand: "Daikin", model: "1.5 Ton 5 Star Inverter Split AC", base: 52990, disc: 45990 },
  { brand: "Daikin", model: "1 Ton 5 Star Inverter Split AC", base: 44990, disc: 38990 },
  { brand: "Dyson", model: "V12 Detect Slim Cordless Vacuum", base: 58900, disc: 52900 },
  { brand: "Dyson", model: "V15 Detect Absolute", base: 64900, disc: 57900 },
  { brand: "Dyson", model: "Big Ball Animal Pro 2", base: 52900, disc: 46900 },
  { brand: "Morphy Richards", model: "OTG 52L", base: 14999, disc: 11999 },
  { brand: "Morphy Richards", model: "OTG 25L", base: 9999, disc: 7999 },
  { brand: "Morphy Richards", model: "Champ 500W Mixer Grinder", base: 3499, disc: 2499 },
  { brand: "Crompton", model: "Silent Pro Ceiling Fan", base: 4999, disc: 3999 },
  { brand: "Crompton", model: "Amica Air Cooler 23L", base: 6999, disc: 5499 },
  { brand: "Crompton", model: "Arno Neo 1500W Room Heater", base: 1999, disc: 1499 },
  { brand: "Honeywell", model: "QuietClean Tower Air Purifier", base: 14999, disc: 12999 },
  { brand: "Honeywell", model: "Air Touch U Air Purifier", base: 24999, disc: 21999 },
  { brand: "Xiaomi", model: "Smart Air Purifier 4", base: 14999, disc: 12999 },
  { brand: "Xiaomi", model: "Smart Air Purifier 4 Lite", base: 9999, disc: 8499 },
];

const HEALTH_SPORTS = [
  { brand: "Apple", model: "Watch SE 2nd Gen 40mm", base: 29900, disc: 25900 },
  { brand: "Apple", model: "Watch SE 2nd Gen 44mm", base: 32900, disc: 28900 },
  { brand: "Apple", model: "Watch Series 9 41mm", base: 44900, disc: 39900 },
  { brand: "Apple", model: "Watch Series 9 45mm", base: 47900, disc: 42900 },
  { brand: "Samsung", model: "Galaxy Watch6 40mm", base: 27999, disc: 23999 },
  { brand: "Samsung", model: "Galaxy Watch6 44mm", base: 30999, disc: 26999 },
  { brand: "Samsung", model: "Galaxy Watch6 Classic 43mm", base: 33999, disc: 28999 },
  { brand: "Samsung", model: "Galaxy Watch6 Classic 47mm", base: 37999, disc: 32999 },
  { brand: "Fitbit", model: "Charge 5", base: 14999, disc: 11999 },
  { brand: "Fitbit", model: "Versa 4", base: 22999, disc: 19999 },
  { brand: "Fitbit", model: "Sense 2", base: 27999, disc: 24999 },
  { brand: "Amazfit", model: "GTR 4", base: 16999, disc: 13999 },
  { brand: "Amazfit", model: "GTS 4", base: 13999, disc: 11999 },
  { brand: "Amazfit", model: "T-Rex 3", base: 17999, disc: 15999 },
  { brand: "Noise", model: "ColorFit Pro 5 Max", base: 4999, disc: 3499 },
  { brand: "Noise", model: "ColorFit Pro 5", base: 3999, disc: 2999 },
  { brand: "Noise", model: "ColorFit Ultra 3", base: 3499, disc: 2499 },
  { brand: "boAt", model: "Storm Call", base: 3999, disc: 2499 },
  { brand: "boAt", model: "Wave Pro 47", base: 2999, disc: 1999 },
  { brand: "boAt", model: "Lunar Call Pro", base: 4499, disc: 3499 },
  { brand: "Fire-Boltt", model: "Phoenix Ultra", base: 3999, disc: 2999 },
  { brand: "Fire-Boltt", model: "Oracle", base: 2999, disc: 1999 },
  { brand: "Fire-Boltt", model: "Visionary", base: 2499, disc: 1799 },
  { brand: "OnePlus", model: "Watch 2", base: 24999, disc: 22999 },
  { brand: "OnePlus", model: "Watch 2R", base: 19999, disc: 17999 },
  { brand: "Realme", model: "Watch 5 Pro", base: 4999, disc: 3999 },
  { brand: "Xiaomi", model: "Watch S1 Active", base: 12999, disc: 10999 },
  { brand: "Xiaomi", model: "Redmi Watch 4", base: 5999, disc: 4999 },
  { brand: "Xiaomi", model: "Smart Band 8", base: 2999, disc: 2499 },
  { brand: "Hoffen", model: "Digital Blood Pressure Monitor", base: 1999, disc: 1299 },
  { brand: "HealthSense", model: "BS-Medica Plus Body Scale", base: 2499, disc: 1799 },
  { brand: "Dr. Trust", model: "Digital Thermometer", base: 399, disc: 249 },
  { brand: "Boldfit", model: "Yoga Mat 6mm Premium", base: 999, disc: 599 },
  { brand: "Boldfit", model: "Resistance Bands Set", base: 799, disc: 499 },
  { brand: "Lifelong", model: "LLHM114 Treadmill", base: 24999, disc: 19999 },
  { brand: "PowerMax", model: "MFT-400 Multifunction Treadmill", base: 49999, disc: 42999 },
  { brand: "Kobo", model: "Exercise Bike 840EB", base: 19999, disc: 16999 },
];

const WATCHES_SMART = [
  { brand: "Apple", model: "Watch Ultra", base: 89900, disc: 79900 },
  { brand: "Apple", model: "Watch Series 9 41mm", base: 44900, disc: 39900 },
  { brand: "Apple", model: "Watch Series 9 45mm", base: 47900, disc: 42900 },
  { brand: "Apple", model: "Watch SE 40mm", base: 29900, disc: 25900 },
  { brand: "Apple", model: "Watch SE 44mm", base: 32900, disc: 28900 },
  { brand: "Samsung", model: "Galaxy Watch6 40mm", base: 27999, disc: 23999 },
  { brand: "Samsung", model: "Galaxy Watch6 44mm", base: 30999, disc: 26999 },
  { brand: "Samsung", model: "Galaxy Watch6 Classic 43mm", base: 33999, disc: 28999 },
  { brand: "Samsung", model: "Galaxy Watch6 Classic 47mm", base: 37999, disc: 32999 },
  { brand: "Samsung", model: "Galaxy Watch5 Pro", base: 32999, disc: 27999 },
  { brand: "Fitbit", model: "Versa 4", base: 22999, disc: 19999 },
  { brand: "Fitbit", model: "Sense 2", base: 27999, disc: 24999 },
  { brand: "Fitbit", model: "Charge 5", base: 14999, disc: 11999 },
  { brand: "Amazfit", model: "GTR 4", base: 16999, disc: 13999 },
  { brand: "Amazfit", model: "T-Rex 3", base: 17999, disc: 15999 },
  { brand: "OnePlus", model: "Watch 2", base: 24999, disc: 22999 },
  { brand: "OnePlus", model: "Watch 2R", base: 19999, disc: 17999 },
  { brand: "Xiaomi", model: "Watch S1 Active", base: 12999, disc: 10999 },
  { brand: "Xiaomi", model: "Redmi Watch 4", base: 5999, disc: 4999 },
];

const WATCHES_ANALOG = [
  { brand: "Casio", model: "G-Shock GA-2100", base: 10995, disc: 8995 },
  { brand: "Casio", model: "G-Shock GA-2100C", base: 11995, disc: 9995 },
  { brand: "Casio", model: "G-Shock GM-2100", base: 14995, disc: 12995 },
  { brand: "Casio", model: "G-Shock DW-5600", base: 8995, disc: 7495 },
  { brand: "Casio", model: "Edifice EFR-539D", base: 14995, disc: 11995 },
  { brand: "Casio", model: "Edifice EFR-305D", base: 9995, disc: 7995 },
  { brand: "Casio", model: "Edifice EFV-100D", base: 6995, disc: 5495 },
  { brand: "Casio", model: "Vintage A168WA", base: 3995, disc: 2995 },
  { brand: "Casio", model: "Vintage F-91W", base: 2995, disc: 2295 },
  { brand: "Titan", model: "Karishma Analog", base: 3495, disc: 2795 },
  { brand: "Titan", model: "Raga Viva Analog", base: 4995, disc: 3995 },
  { brand: "Titan", model: "Raga Crew Analog", base: 6995, disc: 5495 },
  { brand: "Titan", model: "Nebula Analog", base: 12995, disc: 10995 },
  { brand: "Titan", model: "Octane Analog", base: 7995, disc: 6495 },
  { brand: "Fossil", model: "Gen 6 Hybrid", base: 18995, disc: 14995 },
  { brand: "Fossil", model: "Gen 6 Touchscreen", base: 23995, disc: 19995 },
  { brand: "Fossil", model: "Grant Analog", base: 9995, disc: 7995 },
  { brand: "Fossil", model: "Machine Analog", base: 11995, disc: 9995 },
  { brand: "Fossil", model: "Jacqueline Analog", base: 8995, disc: 6995 },
  { brand: "Citizen", model: "Promaster Diver", base: 34995, disc: 29995 },
  { brand: "Citizen", model: "Eco-Drive BM7108", base: 24995, disc: 21995 },
  { brand: "Citizen", model: "Automatic NH8350", base: 19995, disc: 16995 },
  { brand: "Seiko", model: "Presage Automatic", base: 42995, disc: 37995 },
  { brand: "Seiko", model: "5 Sports Automatic", base: 22995, disc: 19995 },
  { brand: "Seiko", model: "Prospex Turtle", base: 34995, disc: 29995 },
  { brand: "Sonata", model: "Voltas Analog-Digital", base: 1299, disc: 899 },
  { brand: "Sonata", model: " Analog", base: 999, disc: 699 },
  { brand: "Fastrack", model: "Reflex Smart", base: 2499, disc: 1799 },
  { brand: "Fastrack", model: "Analog", base: 1499, disc: 1099 },
  { brand: "Daniel Wellington", model: "Classic Cornwall", base: 12999, disc: 9999 },
  { brand: "Daniel Wellington", model: "Classic petite", base: 14999, disc: 11999 },
];

const PERIPHERALS = [
  { brand: "Logitech", model: "MX Master 3 Mouse", base: 8495, disc: 6995 },
  { brand: "Logitech", model: "MX Master 3S Mouse", base: 9995, disc: 8495 },
  { brand: "Logitech", model: "MX Keys Keyboard", base: 11995, disc: 9995 },
  { brand: "Logitech", model: "K380 Keyboard", base: 3995, disc: 2995 },
  { brand: "Logitech", model: "K480 Keyboard", base: 4995, disc: 3995 },
  { brand: "Logitech", model: "M331 Silent Mouse", base: 1795, disc: 1295 },
  { brand: "Logitech", model: "M240 Silent Mouse", base: 1495, disc: 1095 },
  { brand: "Logitech", model: "C920 Webcam", base: 5995, disc: 4995 },
  { brand: "Logitech", model: "Brio 300 Webcam", base: 5995, disc: 4995 },
  { brand: "Dell", model: "MS116 Mouse", base: 899, disc: 699 },
  { brand: "Dell", model: "KM113 Keyboard+Mouse", base: 1499, disc: 1199 },
  { brand: "Dell", model: "KM117 Keyboard+Mouse", base: 1999, disc: 1599 },
  { brand: "HP", model: "FM100 Mouse", base: 699, disc: 499 },
  { brand: "HP", model: "FK100 Keyboard", base: 999, disc: 799 },
  { brand: "HP", model: "230 Keyboard+Mouse", base: 1499, disc: 1199 },
  { brand: "HP", model: " 3200 Webcam", base: 3999, disc: 2999 },
  { brand: "ASUS", model: "ROG Keris Mouse", base: 6999, disc: 5999 },
  { brand: "ASUS", model: "ROG Falchion Keyboard", base: 14999, disc: 12999 },
  { brand: "ASUS", model: "ROG Strix Go Headset", base: 9999, disc: 8499 },
  { brand: "Samsung", model: "980 PRO 1TB NVMe SSD", base: 12999, disc: 9999 },
  { brand: "Samsung", model: "980 PRO 500GB NVMe SSD", base: 7999, disc: 6499 },
  { brand: "Samsung", model: "870 EVO 1TB SATA SSD", base: 8999, disc: 7499 },
  { brand: "Samsung", model: "870 EVO 500GB SATA SSD", base: 4999, disc: 3999 },
  { brand: "WD", model: "Blue SN570 1TB NVMe SSD", base: 7999, disc: 6499 },
  { brand: "WD", model: "Blue SN570 500GB NVMe SSD", base: 4499, disc: 3499 },
  { brand: "Crucial", model: "8GB DDR4 RAM", base: 2499, disc: 1899 },
  { brand: "Crucial", model: "16GB DDR4 RAM", base: 4499, disc: 3499 },
  { brand: "Crucial", model: "32GB DDR4 RAM", base: 7999, disc: 6499 },
  { brand: "Corsair", model: "Vengeance 16GB DDR5 RAM", base: 6999, disc: 5999 },
  { brand: "Corsair", model: "Vengeance 32GB DDR5 RAM", base: 12999, disc: 10999 },
  { brand: "TP-Link", model: "Archer AX73 Wi-Fi 6 Router", base: 8999, disc: 6999 },
  { brand: "TP-Link", model: "Archer AX55 Wi-Fi 6 Router", base: 6999, disc: 5499 },
  { brand: "TP-Link", model: "Deco M5 Mesh Router (3-pack)", base: 14999, disc: 12999 },
  { brand: "Asus", model: "RT-AX58U Dual Band Router", base: 12999, disc: 9999 },
  { brand: "Asus", model: "RT-AX86U Pro Gaming Router", base: 24999, disc: 21999 },
  { brand: "Eve", model: "Noise Cancelling Earbuds Pro", base: 5999, disc: 4499 },
  { brand: "Elgato", model: "Stream Deck MK.2", base: 14999, disc: 12999 },
  { brand: "Elgato", model: "Key Light", base: 14999, disc: 12999 },
];

// ═══════════════════════════════════════════════════════════════════
// GENERATOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function generateTVs() {
  const products = [];
  for (const brand of TV_BRANDS) {
    for (const size of TV_SIZES) {
      const model = pickRandom(brand.models);
      const sizeNum = parseInt(size);
      const basePrice = Math.round(sizeNum * 600 + rand(-5000, 10000) + 5000);
      const discount = Math.round(basePrice * (0.75 + Math.random() * 0.1));
      products.push({
        title: `${brand.name} ${size} ${model} Smart TV`,
        brand: brand.name,
        price: basePrice,
        discountedPrice: discount,
        compareAtPrice: basePrice,
        sku: `${brand.name.substring(0, 3).toUpperCase()}-${slug(model).substring(0, 8)}-${sizeNum}`,
        stock: rand(8, 35),
        category: "Televisions",
        isFeatured: Math.random() > 0.7,
      });
    }
  }
  return products;
}

function generateLaptopsAndPC() {
  const products = [];
  for (const brand of LAPTOP_BRANDS) {
    for (const line of brand.lines) {
      for (const variant of line.variants) {
        const skuBase = `${brand.name.substring(0, 3).toUpperCase()}-${slug(line.model).substring(0, 12)}`;
        products.push({
          title: `${line.model} ${variant}`,
          brand: brand.name,
          price: line.basePrice + rand(-2000, 5000),
          discountedPrice: line.discount + rand(-1000, 3000),
          compareAtPrice: line.basePrice,
          sku: `${skuBase}-${slug(variant)}`,
          stock: rand(5, 30),
          category: "Laptop & PC",
          isFeatured: Math.random() > 0.8,
        });
      }
    }
  }
  // Add peripherals
  for (const p of PERIPHERALS) {
    products.push({
      title: `${p.brand} ${p.model}`,
      brand: p.brand,
      price: p.base,
      discountedPrice: p.disc,
      compareAtPrice: p.base,
      sku: `${p.brand.substring(0, 3).toUpperCase()}-${slug(p.model).substring(0, 16)}`,
      stock: rand(10, 60),
      category: "Laptop & PC",
      isFeatured: false,
    });
  }
  return products;
}

function generateMobilesAndTablets() {
  const products = [];
  for (const brand of MOBILE_BRANDS) {
    for (const model of brand.models) {
      for (const variant of model.variants) {
        const colors = ["Black", "Blue", "White", "Green", "Purple", "Gold", "Silver"];
        const color = pickRandom(colors);
        const skuBase = `${brand.name.substring(0, 3).toUpperCase()}-${slug(model.model).substring(0, 12)}`;
        products.push({
          title: `${model.model} ${variant} - ${color}`,
          brand: brand.name,
          price: model.basePrice + rand(-2000, 3000),
          discountedPrice: model.discount + rand(-1000, 2000),
          compareAtPrice: model.basePrice,
          sku: `${skuBase}-${slug(variant)}-${color.substring(0, 3).toUpperCase()}`,
          stock: rand(10, 50),
          category: "Mobile & Tablets",
          isFeatured: Math.random() > 0.85,
        });
      }
    }
  }
  // Add tablets
  for (const brand of TABLET_BRANDS) {
    for (const model of brand.models) {
      for (const variant of model.variants) {
        const skuBase = `${brand.name.substring(0, 3).toUpperCase()}-TAB-${slug(model.model).substring(0, 10)}`;
        products.push({
          title: `${model.model} ${variant}`,
          brand: brand.name,
          price: model.basePrice + rand(-2000, 3000),
          discountedPrice: model.discount + rand(-1000, 2000),
          compareAtPrice: model.basePrice,
          sku: `${skuBase}-${slug(variant)}`,
          stock: rand(8, 30),
          category: "Mobile & Tablets",
          isFeatured: Math.random() > 0.85,
        });
      }
    }
  }
  return products;
}

function generateGamingAndVideo() {
  const products = [];
  for (const p of GAMING_PRODUCTS) {
    products.push({
      title: `${p.brand} ${p.model}`,
      brand: p.brand,
      price: p.base,
      discountedPrice: p.disc,
      compareAtPrice: p.base,
      sku: `${p.brand.substring(0, 3).toUpperCase()}-${slug(p.model).substring(0, 16)}`,
      stock: rand(5, 40),
      category: "Games & Videos",
      isFeatured: Math.random() > 0.8,
    });
  }
  for (const p of CAMERA_PRODUCTS) {
    products.push({
      title: `${p.brand} ${p.model}`,
      brand: p.brand,
      price: p.base,
      discountedPrice: p.disc,
      compareAtPrice: p.base,
      sku: `${p.brand.substring(0, 3).toUpperCase()}-${slug(p.model).substring(0, 16)}`,
      stock: rand(5, 25),
      category: "Games & Videos",
      isFeatured: Math.random() > 0.8,
    });
  }
  return products;
}

function generateHomeAppliances() {
  const products = [];
  for (const p of HOME_APPLIANCES) {
    products.push({
      title: `${p.brand} ${p.model}`,
      brand: p.brand,
      price: p.base,
      discountedPrice: p.disc,
      compareAtPrice: p.base,
      sku: `${p.brand.substring(0, 3).toUpperCase()}-${slug(p.model).substring(0, 16)}`,
      stock: rand(5, 50),
      category: "Home Appliances",
      isFeatured: Math.random() > 0.85,
    });
  }
  return products;
}

function generateHealthSports() {
  const products = [];
  for (const p of HEALTH_SPORTS) {
    products.push({
      title: `${p.brand} ${p.model}`,
      brand: p.brand,
      price: p.base,
      discountedPrice: p.disc,
      compareAtPrice: p.base,
      sku: `${p.brand.substring(0, 3).toUpperCase()}-${slug(p.model).substring(0, 16)}`,
      stock: rand(5, 60),
      category: "Health & Sports",
      isFeatured: Math.random() > 0.85,
    });
  }
  return products;
}

function generateWatches() {
  const products = [];
  const allWatches = [...WATCHES_SMART, ...WATCHES_ANALOG];
  for (const p of allWatches) {
    products.push({
      title: `${p.brand} ${p.model}`,
      brand: p.brand,
      price: p.base,
      discountedPrice: p.disc,
      compareAtPrice: p.base,
      sku: `${p.brand.substring(0, 3).toUpperCase()}-${slug(p.model).substring(0, 16)}`,
      stock: rand(5, 40),
      category: "Watches",
      isFeatured: Math.random() > 0.8,
    });
  }
  return products;
}

function generateAudio() {
  const products = [];
  const allAudio = [
    ...AUDIO_HEADPHONES.map((p) => ({ ...p, type: "Headphones" })),
    ...AUDIO_EARBUDS.map((p) => ({ ...p, type: "Earbuds" })),
    ...AUDIO_SPEAKERS.map((p) => ({ ...p, type: "Speaker" })),
  ];
  for (const p of allAudio) {
    products.push({
      title: `${p.brand} ${p.model}`,
      brand: p.brand,
      price: p.base,
      discountedPrice: p.disc,
      compareAtPrice: p.base,
      sku: `${p.brand.substring(0, 3).toUpperCase()}-${slug(p.model).substring(0, 16)}`,
      stock: rand(10, 80),
      category: "Audio & Speakers",
      isFeatured: Math.random() > 0.8,
    });
  }
  return products;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN GENERATION
// ═══════════════════════════════════════════════════════════════════

console.log("Generating product catalog...\n");

const allProducts = [
  ...generateTVs(),
  ...generateLaptopsAndPC(),
  ...generateMobilesAndTablets(),
  ...generateGamingAndVideo(),
  ...generateHomeAppliances(),
  ...generateHealthSports(),
  ...generateWatches(),
  ...generateAudio(),
];

// Remove duplicate SKUs
const seen = new Set();
const uniqueProducts = [];
for (const p of allProducts) {
  if (!seen.has(p.sku)) {
    seen.add(p.sku);
    uniqueProducts.push(p);
  }
}

console.log(`Generated ${uniqueProducts.length} unique products`);

// Count by category
const counts = {};
for (const p of uniqueProducts) {
  counts[p.category] = (counts[p.category] || 0) + 1;
}
console.log("\nBy category:");
for (const [cat, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

// Write to file
const output = `/**
 * Auto-generated Product Catalog — ${uniqueProducts.length} products
 * Generated by scripts/generate-catalog.js
 * Do NOT edit manually — run \`node scripts/generate-catalog.js\` to regenerate
 */

const CATALOG = ${JSON.stringify(uniqueProducts, null, 2)};

module.exports = CATALOG;
`;

const outputPath = path.join(__dirname, "product-catalog.js");
fs.writeFileSync(outputPath, output, "utf-8");
console.log(`\n✅ Written to ${outputPath}`);
