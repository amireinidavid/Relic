import { PrismaClient, ProductType, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedProduct {
  name: string;
  brand: string;
  description: string;
  price: number;
  baseStock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  categoryName: string;
  variations: Array<{
    size: string;
    stock: number;
  }>;
  specs: Array<{
    key: string;
    value: string;
    group: string;
  }>;
  images: string[];
}

async function main() {
  // Create categories
  const categories = [
    {
      name: "Fashion",
      type: ProductType.FASHION,
      description: "Clothing and apparel",
    },
    {
      name: "Shoes",
      type: ProductType.SHOES,
      description: "Footwear collection",
    },
    {
      name: "Electronics",
      type: ProductType.ELECTRONICS,
      description: "Gadgets, phones, and computers",
    },
    {
      name: "Beauty",
      type: ProductType.BEAUTY,
      description: "Skincare, makeup, and personal care",
    },
    {
      name: "Home Decor",
      type: ProductType.HOME_DECOR,
      description: "Furniture, lighting, and home accessories",
    },
    {
      name: "Accessories",
      type: ProductType.ACCESSORIES,
      description: "Jewelry, watches, and bags",
    },
    {
      name: "Books",
      type: ProductType.BOOKS,
      description: "Physical and digital books",
    },
  ];

  // Create size guides for Fashion and Shoes
  const sizeGuides = [
    {
      categoryName: "Fashion",
      type: "CLOTHING",
      measurements: ["chest", "waist", "hips", "length"],
      sizeChart: {
        XS: { chest: "32-34", waist: "26-28", hips: "34-36", length: "38" },
        S: { chest: "34-36", waist: "28-30", hips: "36-38", length: "39" },
        M: { chest: "36-38", waist: "30-32", hips: "38-40", length: "40" },
        L: { chest: "38-40", waist: "32-34", hips: "40-42", length: "41" },
        XL: { chest: "40-42", waist: "34-36", hips: "42-44", length: "42" },
        XXL: { chest: "42-44", waist: "36-38", hips: "44-46", length: "43" },
      },
    },
    {
      categoryName: "Shoes",
      type: "SHOES",
      measurements: ["length", "width"],
      sizeChart: {
        "36": { length: "22.5", width: "8.5" },
        "37": { length: "23", width: "8.7" },
        "38": { length: "23.5", width: "8.9" },
        "39": { length: "24", width: "9.1" },
        "40": { length: "24.5", width: "9.3" },
        "41": { length: "25", width: "9.5" },
        "42": { length: "25.5", width: "9.7" },
        "43": { length: "26", width: "9.9" },
        "44": { length: "26.5", width: "10.1" },
        "45": { length: "27", width: "10.3" },
      },
    },
  ];

  // Upsert categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Create size guides
  for (const guide of sizeGuides) {
    const category = await prisma.category.findUnique({
      where: { name: guide.categoryName },
    });

    if (category) {
      await prisma.sizeGuide.upsert({
        where: {
          id: `${guide.categoryName}-${guide.type}`,
        },
        update: {
          sizeChart: guide.sizeChart,
          measurements: guide.measurements,
        },
        create: {
          id: `${guide.categoryName}-${guide.type}`,
          category: { connect: { id: category.id } },
          type: guide.type as any,
          sizeChart: guide.sizeChart,
          measurements: guide.measurements,
        },
      });
    }
  }

  // Create home page configuration
  await prisma.homePageConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heroSectionEnabled: true,
      trustSignalsEnabled: true,
      featuredCategoriesEnabled: true,
      trendingProductsEnabled: true,
      promotionalBannersEnabled: true,
      personalizedRecsEnabled: true,
      flashSalesEnabled: true,
      blogSectionEnabled: true,
      updatedBy: "system",
    },
  });

  // Sample product data
  const products: SeedProduct[] = [
    {
      name: "White Classic T-Shirt",
      brand: "FashionBrand",
      description:
        "Premium cotton classic t-shirt with comfortable fit and breathable fabric.",
      price: 2999,
      baseStock: 50,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Fashion",
      variations: [
        { size: "S", stock: 15 },
        { size: "M", stock: 20 },
        { size: "L", stock: 15 },
      ],
      specs: [
        { key: "Material", value: "100% Cotton", group: "General" },
        { key: "Care", value: "Machine Washable", group: "Maintenance" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908194/r4kuoyszmn8wgqgxx29t.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908194/n9w738sxzhc7wkgbqs21.jpg",
      ],
    },
    {
      name: "Premium Leather Sneakers",
      brand: "FootwearCo",
      description:
        "Handcrafted leather sneakers with superior comfort and style.",
      price: 8999,
      baseStock: 30,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: false,
      isNewArrival: true,
      categoryName: "Shoes",
      variations: [
        { size: "40", stock: 10 },
        { size: "41", stock: 10 },
        { size: "42", stock: 10 },
      ],
      specs: [
        { key: "Material", value: "Genuine Leather", group: "General" },
        { key: "Sole", value: "Rubber", group: "Construction" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908193/rosqrpjz68e6ma4ziueo.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908193/rosqrpjz68e6ma4ziueo.jpg",
      ],
    },
    {
      name: "Smart LED TV 55-inch",
      brand: "TechPro",
      description:
        "4K Ultra HD Smart LED TV with HDR and built-in streaming apps.",
      price: 89999,
      baseStock: 20,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Electronics",
      variations: [],
      specs: [
        { key: "Screen Size", value: "55 inches", group: "Display" },
        { key: "Resolution", value: "4K Ultra HD", group: "Display" },
        {
          key: "Smart Features",
          value: "Built-in WiFi, Apps",
          group: "Features",
        },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908193/elnckutkoqyps2cz0b90.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908193/elnckutkoqyps2cz0b90.jpg",
      ],
    },
    {
      name: "Luxury Watch Collection",
      brand: "TimeKeeper",
      description: "Premium stainless steel watch with automatic movement.",
      price: 29999,
      baseStock: 15,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: false,
      categoryName: "Accessories",
      variations: [],
      specs: [
        { key: "Movement", value: "Automatic", group: "Technical" },
        { key: "Material", value: "Stainless Steel", group: "Construction" },
        { key: "Water Resistance", value: "50m", group: "Features" },
      ],
      images: [
        "https://res-console.cloudinary.com/dcc1bsx86/media_explorer_thumbnails/12546dda4b2e30068242606ec434b8fd/detailed",
        "https://res-console.cloudinary.com/dcc1bsx86/media_explorer_thumbnails/dfcd42a152093583ce60d21e391687b4/detailed",
      ],
    },
    {
      name: "Organic Skincare Set",
      brand: "NatureCare",
      description:
        "Complete organic skincare routine with cleanser, toner, and moisturizer.",
      price: 4999,
      baseStock: 40,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Beauty",
      variations: [],
      specs: [
        { key: "Type", value: "Organic", group: "General" },
        { key: "Skin Type", value: "All Skin Types", group: "Usage" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Designer Denim Jeans",
      brand: "DenimCo",
      description:
        "Premium quality denim jeans with perfect fit and durability.",
      price: 5999,
      baseStock: 45,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: false,
      categoryName: "Fashion",
      variations: [
        { size: "30", stock: 15 },
        { size: "32", stock: 15 },
        { size: "34", stock: 15 },
      ],
      specs: [
        { key: "Material", value: "Premium Denim", group: "General" },
        { key: "Fit", value: "Regular", group: "Style" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Wireless Gaming Headset",
      brand: "AudioTech",
      description: "High-performance gaming headset with surround sound.",
      price: 12999,
      baseStock: 25,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Electronics",
      variations: [],
      specs: [
        { key: "Battery Life", value: "20 hours", group: "Technical" },
        { key: "Connectivity", value: "Bluetooth 5.0", group: "Features" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Running Shoes Pro",
      brand: "SportFit",
      description:
        "Professional running shoes with advanced cushioning technology.",
      price: 7999,
      baseStock: 35,
      status: ProductStatus.PUBLISHED,
      isFeatured: false,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Shoes",
      variations: [
        { size: "39", stock: 10 },
        { size: "40", stock: 15 },
        { size: "41", stock: 10 },
      ],
      specs: [
        { key: "Type", value: "Running", group: "General" },
        { key: "Technology", value: "Air Cushion", group: "Features" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Luxury Perfume Collection",
      brand: "Scentia",
      description: "Exclusive perfume collection with long-lasting fragrance.",
      price: 8999,
      baseStock: 20,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Beauty",
      variations: [],
      specs: [
        { key: "Volume", value: "100ml", group: "General" },
        { key: "Fragrance", value: "Oriental", group: "Features" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Smart Fitness Watch",
      brand: "TechFit",
      description: "Advanced fitness tracker with heart rate monitoring.",
      price: 15999,
      baseStock: 30,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Electronics",
      variations: [],
      specs: [
        { key: "Battery", value: "5 days", group: "Technical" },
        { key: "Water Resistance", value: "50m", group: "Features" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Casual Summer Dress",
      brand: "StyleFusion",
      description: "Light and breezy summer dress perfect for casual outings.",
      price: 4999,
      baseStock: 40,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: false,
      isNewArrival: true,
      categoryName: "Fashion",
      variations: [
        { size: "S", stock: 15 },
        { size: "M", stock: 15 },
        { size: "L", stock: 10 },
      ],
      specs: [
        { key: "Material", value: "Cotton Blend", group: "General" },
        { key: "Style", value: "Casual", group: "Design" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Professional Camera Kit",
      brand: "PhotoPro",
      description: "Complete professional camera kit with accessories.",
      price: 149999,
      baseStock: 10,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Electronics",
      variations: [],
      specs: [
        { key: "Sensor", value: "Full Frame", group: "Technical" },
        { key: "Resolution", value: "45MP", group: "Features" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Designer Handbag",
      brand: "LuxuryStyle",
      description: "Premium leather designer handbag with gold hardware.",
      price: 19999,
      baseStock: 15,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: false,
      categoryName: "Accessories",
      variations: [],
      specs: [
        { key: "Material", value: "Genuine Leather", group: "General" },
        { key: "Size", value: "Medium", group: "Dimensions" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Anti-Aging Cream Set",
      brand: "BeautyGlow",
      description: "Premium anti-aging skincare set with natural ingredients.",
      price: 7999,
      baseStock: 25,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Beauty",
      variations: [],
      specs: [
        { key: "Size", value: "50ml", group: "General" },
        { key: "Skin Type", value: "All Types", group: "Usage" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Formal Business Suit",
      brand: "EliteStyle",
      description: "Classic business suit with modern fit and premium fabric.",
      price: 29999,
      baseStock: 20,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: false,
      isNewArrival: true,
      categoryName: "Fashion",
      variations: [
        { size: "38", stock: 5 },
        { size: "40", stock: 10 },
        { size: "42", stock: 5 },
      ],
      specs: [
        { key: "Material", value: "Wool Blend", group: "General" },
        { key: "Style", value: "Slim Fit", group: "Design" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Wireless Earbuds Pro",
      brand: "SoundTech",
      description: "Premium wireless earbuds with noise cancellation.",
      price: 9999,
      baseStock: 35,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Electronics",
      variations: [],
      specs: [
        { key: "Battery", value: "24 hours", group: "Technical" },
        { key: "Features", value: "ANC, Water Resistant", group: "Features" },
      ],
      images: [
        "https://res-console.cloudinary.com/dcc1bsx86/media_explorer_thumbnails/95efb6332c048bc340696cbe30020051/detailed",
        "https://res-console.cloudinary.com/dcc1bsx86/media_explorer_thumbnails/dfcd42a152093583ce60d21e391687b4/detailed",
      ],
    },
    {
      name: "Classic Oxford Shoes",
      brand: "FootElite",
      description: "Premium leather Oxford shoes for formal occasions.",
      price: 12999,
      baseStock: 25,
      status: ProductStatus.PUBLISHED,
      isFeatured: false,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Shoes",
      variations: [
        { size: "40", stock: 8 },
        { size: "41", stock: 9 },
        { size: "42", stock: 8 },
      ],
      specs: [
        { key: "Material", value: "Italian Leather", group: "General" },
        { key: "Sole", value: "Leather", group: "Construction" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Smart Home Hub",
      brand: "TechHome",
      description: "Central smart home control system with voice commands.",
      price: 17999,
      baseStock: 20,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Electronics",
      variations: [],
      specs: [
        {
          key: "Compatibility",
          value: "All Major Platforms",
          group: "Technical",
        },
        { key: "Connectivity", value: "WiFi, Bluetooth", group: "Features" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Premium Makeup Kit",
      brand: "GlamourPro",
      description: "Complete professional makeup kit with premium products.",
      price: 13999,
      baseStock: 20,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Beauty",
      variations: [],
      specs: [
        { key: "Type", value: "Professional", group: "General" },
        { key: "Contents", value: "30 pieces", group: "Package" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
    {
      name: "Designer Sunglasses",
      brand: "VisionLux",
      description: "Premium designer sunglasses with UV protection.",
      price: 8999,
      baseStock: 30,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      categoryName: "Accessories",
      variations: [],
      specs: [
        { key: "Protection", value: "UV400", group: "Technical" },
        { key: "Material", value: "Acetate Frame", group: "Construction" },
      ],
      images: [
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
        "https://res.cloudinary.com/dcc1bsx86/image/upload/v1739908192/mp3urcgmt0dwrsfk39jm.jpg",
      ],
    },
  ];

  // Seed products
  for (const productData of products) {
    const category = await prisma.category.findUnique({
      where: { name: productData.categoryName },
    });

    if (!category) continue;

    const slug = `${productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        brand: productData.brand,
        description: productData.description,
        price: productData.price,
        baseStock: productData.baseStock,
        status: productData.status as ProductStatus,
        slug,
        isFeatured: productData.isFeatured,
        isTrending: productData.isTrending,
        isNewArrival: productData.isNewArrival,
        category: {
          connect: { id: category.id },
        },
        variations: {
          create: productData.variations.map((v) => ({
            type: category.type === "FASHION" ? "clothes" : "shoes",
            size: v.size,
            stock: v.stock,
          })),
        },
        specifications: {
          create: productData.specs.map((spec, index) => ({
            key: spec.key,
            value: spec.value,
            group: spec.group,
            order: index,
          })),
        },
        productImages: {
          create: productData.images.map((url, index) => ({
            url,
            publicId: `demo/products/${slug}-${index}`,
            width: 800,
            height: 800,
            format: "jpg",
            size: 50000,
            thumbnailUrl: `${url}?w=100&h=100`,
            mediumUrl: `${url}?w=400&h=400`,
            order: index,
          })),
        },
      },
    });

    // Create flash sale for some products
    if (Math.random() > 0.5) {
      await prisma.flashSale.create({
        data: {
          productId: product.id,
          discount: Math.floor(Math.random() * 50) + 10, // Random discount between 10-60%
          startTime: new Date(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isActive: true,
        },
      });
    }
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
