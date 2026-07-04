import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type CmsImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  className?: string;
};

export function CmsImage({ alt, className, ...props }: CmsImageProps) {
  return <Image alt={alt} className={cn(className)} {...props} />;
}
