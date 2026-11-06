import { Heart } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { readAuthSession } from "@/services/api/auth";
import { toggleWishlist } from "@/services/api/wishlist.service";
import { cn } from "@/lib/utils";

export function WishlistToggle({
  productId,
  wishlistId,
  className,
  onChange,
}: {
  productId?: string | undefined;
  wishlistId?: string | undefined;
  className?: string | undefined;
  onChange?: (() => void) | undefined;
}) {
  const [isSaved, setIsSaved] = useState(Boolean(wishlistId));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const session = readAuthSession();

  useEffect(() => setIsSaved(Boolean(wishlistId)), [wishlistId]);

  async function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!session || !productId || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await toggleWishlist(productId, session.accountId);
      const action = result[0]?.action;
      const nextSaved = action ? action === "added" : !isSaved;
      setIsSaved(nextSaved);
      setMessage(nextSaved ? "Added to wishlist" : "Removed from wishlist");
      onChange?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wishlist could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(event) => void handleToggle(event)}
      disabled={!session || !productId || busy}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isSaved}
      title={!session ? "Sign in to use your wishlist" : isSaved ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "grid size-10 place-items-center rounded-full border border-border bg-background/95 text-foreground shadow-sm transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",
        isSaved && "text-primary",
        className,
      )}
    >
      <Heart className={cn("size-4", isSaved && "fill-current")} />
      <span className="sr-only" aria-live="polite">{message}</span>
    </button>
  );
}
