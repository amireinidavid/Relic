"use client";

import { useProductStore } from "@/store/UseProductsStore";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ProductDetailsSkeleton from "./productSkeleton";

interface ProductDetailsContentProps {
id: string;
}

const ProductDetailsContent = ({ id }: ProductDetailsContentProps) => {
const [product, setProduct] = useState<Product | null>(null);
const [thumbsSwiper, setThumbsSwiper] = useState(null);
const [selectedImage, setSelectedImage] = useState(0);
const [isLoading, setIsLoading] = useState(true);
const getProductById = useProductStore((state) => state.getProductById);
console.log(product, "product");
useEffect(() => {
const fetchProduct = async () => {
try {
setIsLoading(true);
console.log("Fetching product with ID:", id); // Debug log
const productData = await getProductById(id);
console.log("Received product data:", productData); // Debug log

        if (productData) {
          setProduct(productData);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }

}, [id, getProductById]);

// Show loading skeleton while fetching data
if (isLoading) {
return <ProductDetailsSkeleton />;
}

// Show error if no product found
if (!product) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-center">
<h2 className="text-2xl font-bold text-gray-800 mb-2">
Product Not Found
</h2>
<p className="text-gray-600">
The requested product could not be found.
</p>
</div>
</div>
);
}

// Calculate flash sale discount if available
const flashSaleProduct = product.flashSale;
const discountedPrice = flashSaleProduct?.discountPrice;
const discountPercentage = flashSaleProduct?.discount;

return (
<div className="min-h-screen bg-white">
<div className="container mx-auto px-4 py-8">
<div className="flex flex-col lg:flex-row gap-8">
{/_ Left Column - Image Gallery _/}
<div className="lg:w-2/3">
<div className="flex flex-col-reverse lg:flex-row gap-4">
{/_ Thumbnail Navigation _/}
<div className="lg:w-24">
{product.productImages && product.productImages.length > 0 && (
<Swiper
onSwiper={(swiper: any) => setThumbsSwiper(swiper)}
direction="vertical"
spaceBetween={10}
slidesPerView={4}
freeMode={true}
watchSlidesProgress={true}
modules={[FreeMode, Navigation, Thumbs]}
className="thumbnails-swiper h-96" >
{product.productImages.map((image, index) => (
<SwiperSlide key={image.id}>
<div
className={`cursor-pointer border-2 ${
                            selectedImage === index
                              ? "border-black"
                              : "border-transparent"
                          }`}
onClick={() => setSelectedImage(index)} >
<img
src={image.mediumUrl}
alt={`${product.name} thumbnail ${index + 1}`}
className="w-full h-24 object-cover"
/>
</div>
</SwiperSlide>
))}
</Swiper>
)}
</div>

              {/* Main Image */}
              <div className="flex-1">
                {product.productImages && product.productImages.length > 0 && (
                  <Swiper
                    spaceBetween={10}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="main-swiper"
                  >
                    {product.productImages.map((image) => (
                      <SwiperSlide key={image.id}>
                        <img
                          src={image.url}
                          alt={product.name}
                          className="w-full aspect-[3/4] object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:w-1/3 space-y-6">
            {/* Product Category & Name */}
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category?.name || "Uncategorized"}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-gray-500">{product.brand}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">
                {formatPrice(discountedPrice || product.price)}
              </span>
              {discountPercentage && (
                <Badge variant="destructive">{discountPercentage}% OFF</Badge>
              )}
            </div>

            {/* Variations */}
            {product.variations && product.variations.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Size</h3>
                <div className="flex gap-2">
                  {product.variations.map((variation) => (
                    <Button
                      key={variation.id}
                      variant="outline"
                      className="w-12 h-12"
                    >
                      {variation.size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex gap-2">
              {product.isNewArrival && (
                <Badge variant="secondary">New Arrival</Badge>
              )}
              {product.isTrending && (
                <Badge variant="secondary">Trending</Badge>
              )}
              {product.isFeatured && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>

            {/* Stock Status */}
            <div>
              <p className="text-sm text-gray-600">
                Stock: {product.baseStock} units available
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Specifications</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {product.specifications.map((spec) => (
                    <li key={spec.id}>
                      {spec.key}: {spec.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

);
};

export default ProductDetailsContent;
