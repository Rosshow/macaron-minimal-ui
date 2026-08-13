import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-5 tracking-wide",
  {
    variants: {
      tone: {
        mint: "bg-mint-soft text-mint",
        sky: "bg-sky-soft text-sky",
        rose: "bg-rose-soft text-rose",
        butter: "bg-butter-soft text-butter",
        lilac: "bg-lilac-soft text-lilac",
        apricot: "bg-apricot-soft text-apricot",
        muted: "bg-muted text-muted-foreground",
        gray: "bg-gray-soft text-gray",
        blue: "bg-blue-soft text-blue-2",
        "blue-deep": "bg-blue-soft text-blue-1",
        "blue-3": "bg-blue-soft text-blue-3",
        "blue-muted": "bg-muted text-blue-2",
        "blue-4": "bg-[color-mix(in_oklab,var(--blue-4)_10%,var(--card))] text-blue-3",
        "blue-5": "bg-[color-mix(in_oklab,var(--blue-5)_12%,var(--card))] text-blue-3",
      },
      size: {
        sm: "px-2 py-0 text-[10px]",
        md: "",
      },
    },
    defaultVariants: { tone: "blue", size: "md" },
  },
);

export type TagProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof tagVariants>;

export function Tag({ className, tone, size, ...props }: TagProps) {
  return <span className={cn(tagVariants({ tone, size }), className)} {...props} />;
}
