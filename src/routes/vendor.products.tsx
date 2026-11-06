import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Boxes, Check, ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { VendorProduct } from "@/lib/vendor";
import { readAuthSession, type AuthSession } from "@/services/api/auth";
import { VendorOnly } from "@/routes/vendor.orders.index";
import { getCategories } from "@/services/api/category.service";
import { getBrands } from "@/services/api/brand.service";
import { getModels } from "@/services/api/model.service";
import { apiConfig } from "@/services/api/config";
import { manageVendorProducts, type VendorProductRecord } from "@/services/api/vendor-product.service";
import type { BrandRecord, CategoryRecord, ModelRecord } from "@/services/api/models";

export const Route = createFileRoute("/vendor/products")({ component: VendorProductsPage });

const emptyProduct: Omit<VendorProduct, "id"> = {
  name: "", variant: "", category: "", categoryId: "", brandId: "", modelId: "", mrp: "", offerPrice: "",
  shortDescription: "", longDescription: "", specifications: "", imageNames: [], detailImageNames: [], active: true,
};

function productImageUrl(fileName: string) {
  if (/^(https?:)?\/\//i.test(fileName)) return fileName;
  const apiRoot = apiConfig.baseUrl.replace(/\/v1\/?$/, "");
  return `${apiRoot}/uploads/product/${fileName.replace(/^\//, "")}`;
}

function mapVendorProduct(record: VendorProductRecord, categories: CategoryRecord[]): VendorProduct {
  const variantText = record.product_variant ?? "";
  const separator = " — ";
  const separatorIndex = variantText.lastIndexOf(separator);
  const imageNames = (record.product_images ?? "").split(",").map((value) => value.trim()).filter(Boolean).map((value) => value.replace(/^https?:\/\/[^/]+\//i, ""));
  const category = record.category_name ?? categories.find((item) => item.category_id === record.category_id)?.category_name ?? "";
  const mainImage = record.product_image_url || (record.product_image ? productImageUrl(record.product_image) : "");
  return {
    id: record.product_id,
    categoryId: record.category_id ?? "",
    brandId: record.brand_id ?? "",
    modelId: record.model_id ?? "",
    brandName: record.brand_name ?? "",
    modelName: record.model_name ?? "",
    name: separatorIndex >= 0 ? variantText.slice(0, separatorIndex) : variantText,
    variant: separatorIndex >= 0 ? variantText.slice(separatorIndex + separator.length) : "",
    category,
    mrp: record.mrp ?? "",
    offerPrice: record.retailer_price ?? "",
    shortDescription: record.short_description ?? "",
    longDescription: record.long_description ?? "",
    specifications: record.vendor_offer ?? "",
    imageNames,
    detailImageNames: [],
    active: record.status === "1",
    ...(record.product_image ? { mainImagePath: record.product_image } : {}),
    ...(mainImage ? { imageUrl: mainImage } : {}),
  };
}

function VendorProductsPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [filterModels, setFilterModels] = useState<ModelRecord[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mainImageFiles, setMainImageFiles] = useState<File[]>([]);
  const [descriptionImageFiles, setDescriptionImageFiles] = useState<File[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<VendorProduct, "id">>(emptyProduct);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [imagePreview, setImagePreview] = useState("");
  const [unavailableProductImages, setUnavailableProductImages] = useState<Set<string>>(() => new Set());
  useEffect(() => { setSession(readAuthSession()); setReady(true); }, []);
  const loadVendorProducts = async (accountId: string, categoryRecords = categories) => {
    setProductsLoading(true);
    try {
      const records = await manageVendorProducts({ type: "1", customer_id: accountId, product_type: "3" });
      setProducts(records.map((record) => mapVendorProduct(record, categoryRecords)));
      setUnavailableProductImages(new Set());
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not load your products.");
    } finally {
      setProductsLoading(false);
    }
  };
  useEffect(() => {
    if (!ready || session?.accountType !== "vendor") return;
    let active = true;
    void getCategories().then((records) => {
      if (active) setCategories(records);
      if (active) void loadVendorProducts(session.accountId, records);
    }).catch((error: unknown) => {
      if (active) {
        setMessageTone("error");
        setMessage(error instanceof Error ? `Could not load categories: ${error.message}` : "Could not load categories.");
      }
      if (active) void loadVendorProducts(session.accountId, []);
    });
    void getBrands().then((records) => { if (active) setBrands(records); }).catch(() => undefined);
    return () => { active = false; };
  }, [ready, session?.accountType, session?.accountId]);
  useEffect(() => {
    if (!formOpen || !draft.brandId) {
      setModels([]);
      return;
    }
    let active = true;
    void getModels(draft.brandId).then((records) => { if (active) setModels(records); }).catch(() => { if (active) setModels([]); });
    return () => { active = false; };
  }, [formOpen, draft.brandId]);

  useEffect(() => {
    if (brandFilter === "all") {
      setFilterModels([]);
      setModelFilter("all");
      return;
    }
    let active = true;
    void getModels(brandFilter)
      .then((records) => { if (active) setFilterModels(records); })
      .catch(() => { if (active) setFilterModels([]); });
    return () => { active = false; };
  }, [brandFilter]);

  useEffect(() => {
    if (!imagePreview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImagePreview("");
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [imagePreview]);

  const filtered = useMemo(() => products.filter((product) =>
    (categoryFilter === "all" || product.categoryId === categoryFilter) &&
    (brandFilter === "all" || product.brandId === brandFilter) &&
    (modelFilter === "all" || product.modelId === modelFilter) &&
    Object.values(product).flatMap((value) => Array.isArray(value) ? value : [value]).join(" ").toLowerCase().includes(query.trim().toLowerCase()),
  ), [products, categoryFilter, brandFilter, modelFilter, query]);

  if (!ready) return null;
  if (session?.accountType !== "vendor") return <VendorOnly />;

  function startAdd() {
    setEditingId(null);
    setDraft({ ...emptyProduct });
    setMainImageFiles([]);
    setDescriptionImageFiles([]);
    setFormOpen(true);
    setMessage("");
    setMessageTone("success");
  }

  function startEdit(product: VendorProduct) {
    const { id: _id, ...values } = product;
    setEditingId(product.id);
    setDraft({ ...values });
    setMainImageFiles([]);
    setDescriptionImageFiles([]);
    setFormOpen(true);
    setMessage("");
    setMessageTone("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      setMessageTone("error");
      setMessage("Your vendor session has expired. Please sign in again before saving.");
      return;
    }
    const categoryId = draft.categoryId || categories.find((item) => item.category_name === draft.category)?.category_id || "";
    const missingFields = [
      !draft.name.trim() && "product name",
      !draft.variant.trim() && "variant name",
      !draft.brandId && "brand",
      !draft.mrp.trim() && "MRP",
      !draft.offerPrice.trim() && "offer price",
      !draft.shortDescription.trim() && "short description",
    ].filter(Boolean);
    const invalidPrice = !Number.isFinite(Number(draft.mrp)) || !Number.isFinite(Number(draft.offerPrice)) || Number(draft.mrp) < 0 || Number(draft.offerPrice) < 0;
    if (missingFields.length || invalidPrice) {
      setMessageTone("error");
      setMessage(missingFields.length
        ? `Please complete the required fields: ${missingFields.join(", ")}.`
        : "Enter valid amounts for MRP and offer price.");
      return;
    }
    setSaving(true);
    setMessage("");
    const productVariant = [draft.name.trim(), draft.variant.trim()].filter(Boolean).join(" — ");
    const values = {
      type: editingId ? "3" : "2",
      customer_id: session.accountId,
      product_type: "3",
      ...(editingId ? { product_id: editingId } : {}),
      category_id: categoryId,
      brand_id: draft.brandId,
      model_id: draft.modelId,
      product_variant: productVariant,
      short_description: draft.shortDescription,
      long_description: draft.longDescription,
      vendor_offer: draft.specifications,
      ...(mainImageFiles[0] ? { product_image: mainImageFiles[0] } : {}),
      existing_main_image: draft.mainImagePath ?? "",
      "product_images[]": [...mainImageFiles.slice(1), ...descriptionImageFiles],
      "kept_images[]": [...draft.imageNames, ...draft.detailImageNames],
      cgst: "0",
      sgst: "0",
      is_exclusive_tax: "1",
      base_price: draft.mrp || "0",
      mrp: draft.mrp,
      retailer_price: draft.offerPrice,
      hsn_code: "",
      product_sku: "",
      priority: "0",
      status: draft.active ? "1" : "0",
    };
    try {
      await manageVendorProducts(values);
      await loadVendorProducts(session.accountId);
      setMessageTone("success");
      setMessage(editingId ? "Product updated." : "Product added.");
      setFormOpen(false);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not save this product.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id: string) {
    if (!session || !window.confirm("Delete this product?")) return;
    try {
      await manageVendorProducts({ type: "4", customer_id: session.accountId, product_type: "3", product_id: id });
      await loadVendorProducts(session.accountId);
      setMessageTone("success");
      setMessage("Product deleted.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not delete this product.");
    }
  }

  async function toggleActive(product: VendorProduct) {
    if (!session) return;
    const active = !product.active;
    const categoryId = product.categoryId || categories.find((item) => item.category_name === product.category)?.category_id || "";
    try {
      await manageVendorProducts({
        type: "3", customer_id: session.accountId, product_type: "3", product_id: product.id,
        category_id: categoryId, brand_id: product.brandId ?? "", model_id: product.modelId ?? "",
        product_variant: [product.name, product.variant].filter(Boolean).join(" — "),
        short_description: product.shortDescription, long_description: product.longDescription,
        vendor_offer: product.specifications, existing_main_image: product.mainImagePath ?? "",
        "kept_images[]": product.imageNames, cgst: "0", sgst: "0", is_exclusive_tax: "1",
        base_price: product.mrp || "0", mrp: product.mrp, retailer_price: product.offerPrice,
        hsn_code: "", product_sku: "", priority: "0", status: active ? "1" : "0",
      });
      await loadVendorProducts(session.accountId);
      setMessageTone("success");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not update product status.");
    }
  }

  function readFiles(event: ChangeEvent<HTMLInputElement>, field: "imageNames" | "detailImageNames") {
    const files = Array.from(event.target.files ?? []);
    const names = files.map((file) => file.name);
    if (names.length) setDraft((current) => ({ ...current, [field]: [...current[field], ...names] }));
    if (field === "imageNames") setMainImageFiles((current) => [...current, ...files]);
    else setDescriptionImageFiles((current) => [...current, ...files]);
    event.target.value = "";
  }

  return (
    <PageShell>
      <main className="mx-auto min-h-[65vh] w-full max-w-screen-2xl px-4 py-8 md:px-8">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> My profile</Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Vendor workspace</p><h1 className="mt-1 font-display text-4xl">My Products</h1><p className="mt-2 text-sm text-muted-foreground">Manage phone accessories, variants, prices, images, and availability.</p></div><Button type="button" className="rounded-full" onClick={startAdd}><Plus className="size-4" /> Add product</Button></div>
        {message && <p role={messageTone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${messageTone === "error" ? "border border-rose-200 bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{message}</p>}

        {formOpen && (
          <form noValidate onSubmit={saveProduct} className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Product master</p><h2 className="mt-1 font-display text-2xl">{editingId ? "Update accessory" : "Add phone accessory"}</h2></div><button type="button" aria-label="Close product form" onClick={() => setFormOpen(false)} className="grid size-10 place-items-center rounded-full border border-border"><X className="size-4" /></button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Product name<Input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Magnetic clear case" className="mt-1.5 h-11 font-normal" /></label>
              <label className="text-sm font-semibold">Variant name<Input required value={draft.variant} onChange={(event) => setDraft({ ...draft, variant: event.target.value })} placeholder="e.g. iPhone 17 Pro · Clear" className="mt-1.5 h-11 font-normal" /></label>
              <label className="text-sm font-semibold">Category<SearchableSelect value={draft.categoryId ?? ""} onValueChange={(value) => { const selected = categories.find((item) => item.category_id === value); setDraft({ ...draft, categoryId: value, category: selected?.category_name ?? "" }); }} placeholder="Choose category" className="mt-1.5" options={categories.map((item) => ({ value: item.category_id, label: item.category_name }))} /></label>
              <label className="text-sm font-semibold">Brand<SearchableSelect value={draft.brandId ?? ""} onValueChange={(value) => setDraft({ ...draft, brandId: value, modelId: "" })} placeholder="Choose brand" className="mt-1.5" options={brands.map((item) => ({ value: item.brand_id, label: item.brand_name }))} /></label>
              <label className="text-sm font-semibold">Model<SearchableSelect value={draft.modelId ?? ""} onValueChange={(value) => setDraft({ ...draft, modelId: value })} placeholder={draft.brandId ? "Choose model" : "Choose a brand first"} className="mt-1.5" options={models.map((item) => ({ value: item.model_id, label: item.model_name }))} /></label>
              <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">MRP (₹)<Input required type="number" min="0" value={draft.mrp} onChange={(event) => setDraft({ ...draft, mrp: event.target.value })} className="mt-1.5 h-11 font-normal" /></label><label className="text-sm font-semibold">Offer price (₹)<Input required type="number" min="0" value={draft.offerPrice} onChange={(event) => setDraft({ ...draft, offerPrice: event.target.value })} className="mt-1.5 h-11 font-normal" /></label></div>
              <label className="text-sm font-semibold sm:col-span-2">Short description<textarea required rows={2} value={draft.shortDescription} onChange={(event) => setDraft({ ...draft, shortDescription: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none focus:border-primary" /></label>
              <RichEditor label="Long description" value={draft.longDescription} onChange={(value) => setDraft({ ...draft, longDescription: value })} />
              <RichEditor label="Specifications" value={draft.specifications} onChange={(value) => setDraft({ ...draft, specifications: value })} />
              <UploadNames label="Product images" hint="Add one or more product photos." names={draft.imageNames} onChange={(event) => readFiles(event, "imageNames")} />
              <UploadNames label="Description images" hint="Images to show alongside the product description." names={draft.detailImageNames} onChange={(event) => readFiles(event, "detailImageNames")} />
              <fieldset className="rounded-xl border border-border p-4 sm:col-span-2"><legend className="px-1 text-sm font-semibold">Product status</legend><div className="flex flex-wrap gap-3"><label className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold ${draft.active ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-border bg-background"}`}><input type="radio" name="product-status" checked={draft.active} onChange={() => setDraft({ ...draft, active: true })} className="accent-emerald-700" /> Active</label><label className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold ${!draft.active ? "border-slate-500 bg-slate-100 text-slate-800" : "border-border bg-background"}`}><input type="radio" name="product-status" checked={!draft.active} onChange={() => setDraft({ ...draft, active: false })} className="accent-slate-700" /> Inactive</label></div><p className="mt-2 text-xs text-muted-foreground">Active products appear in the vendor product list.</p></fieldset>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="rounded-full" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" className="rounded-full" disabled={saving}>{saving ? "Saving…" : <><Check className="size-4" /> {editingId ? "Save changes" : "Add product"}</>}</Button></div>
          </form>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="h-11 pl-9" /></div>
          <SearchableSelect value={categoryFilter} onValueChange={setCategoryFilter} placeholder="All categories" options={[{ value: "all", label: "All categories" }, ...categories.map((item) => ({ value: item.category_id, label: item.category_name }))]} />
          <SearchableSelect value={brandFilter} onValueChange={(value) => { setBrandFilter(value); setFilterModels([]); setModelFilter("all"); }} placeholder="All brands" options={[{ value: "all", label: "All brands" }, ...brands.map((item) => ({ value: item.brand_id, label: item.brand_name }))]} />
          <SearchableSelect value={modelFilter} onValueChange={setModelFilter} disabled={brandFilter === "all"} disabledPlaceholder="Choose a brand first" placeholder="All models" options={[{ value: "all", label: "All models" }, ...filterModels.map((item) => ({ value: item.model_id, label: item.model_name }))]} />
        </div>

        <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left text-sm">
              <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Image</th><th className="px-4 py-3">Product name</th><th className="px-4 py-3">Variant</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Brand / model</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map((product) => <tr key={product.id}>
                  <td className="px-4 py-3">{product.imageUrl && !unavailableProductImages.has(product.id) ? <button type="button" onClick={() => setImagePreview(product.imageUrl!)} className="grid size-12 place-items-center overflow-hidden rounded-lg bg-muted" aria-label={`Preview ${product.name} image`}><img src={product.imageUrl} alt={product.name} onError={() => setUnavailableProductImages((current) => new Set(current).add(product.id))} className="size-full object-contain" /></button> : <span className="grid size-12 place-items-center rounded-lg bg-primary-soft text-primary"><Boxes className="size-5" /></span>}</td>
                  <td className="px-4 py-3 font-semibold">{product.name}</td><td className="px-4 py-3 text-muted-foreground">{product.variant || "—"}</td><td className="px-4 py-3">{product.category || "—"}</td><td className="px-4 py-3">{[product.brandName, product.modelName].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3"><b>₹{Number(product.offerPrice || 0).toLocaleString("en-IN")}</b><span className="ml-2 text-xs text-muted-foreground line-through">₹{Number(product.mrp || 0).toLocaleString("en-IN")}</span></td>
                  <td className="px-4 py-3"><button type="button" onClick={() => void toggleActive(product)} className={`rounded-full px-3 py-1 text-xs font-semibold ${product.active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{product.active ? "Active" : "Inactive"}</button></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(product)}><Pencil className="size-3.5" /> Edit</Button><Button variant="outline" size="sm" className="rounded-full text-rose-700" onClick={() => void removeProduct(product.id)}><Trash2 className="size-3.5" /> Delete</Button></div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          {productsLoading && <p className="p-8 text-center text-sm text-muted-foreground">Loading your products…</p>}
          {!productsLoading && !filtered.length && <p className="p-8 text-center text-sm text-muted-foreground">No accessories match your filters.</p>}
        </div>
        <div className="mt-4 space-y-3 md:hidden">
          {filtered.map((product) => <article key={product.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              {product.imageUrl && !unavailableProductImages.has(product.id) ? <button type="button" onClick={() => setImagePreview(product.imageUrl!)} className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted" aria-label={`Preview ${product.name} image`}><img src={product.imageUrl} alt={product.name} onError={() => setUnavailableProductImages((current) => new Set(current).add(product.id))} className="size-full object-contain" /></button> : <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Boxes className="size-5" /></span>}
              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h2 className="font-semibold">{product.name}</h2><p className="mt-0.5 text-sm text-muted-foreground">{product.variant || "—"}</p></div><button type="button" onClick={() => void toggleActive(product)} className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{product.active ? "Active" : "Inactive"}</button></div>
                <p className="mt-2 text-xs text-muted-foreground">{[product.category, product.brandName, product.modelName].filter(Boolean).join(" · ") || "—"}</p><p className="mt-2 font-semibold">₹{Number(product.offerPrice || 0).toLocaleString("en-IN")} <span className="ml-1 text-xs font-normal text-muted-foreground line-through">₹{Number(product.mrp || 0).toLocaleString("en-IN")}</span></p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-border pt-3"><Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => startEdit(product)}><Pencil className="size-3.5" /> Edit</Button><Button variant="outline" size="sm" className="flex-1 rounded-full text-rose-700" onClick={() => void removeProduct(product.id)}><Trash2 className="size-3.5" /> Delete</Button></div>
          </article>)}
          {productsLoading && <p className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">Loading your products…</p>}
          {!productsLoading && !filtered.length && <p className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">No accessories match your filters.</p>}
        </div>
        {imagePreview && <div role="dialog" aria-modal="true" aria-label="Product image preview" onMouseDown={(event) => { if (event.target === event.currentTarget) setImagePreview(""); }} className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4" onClick={(event) => { if (event.target === event.currentTarget) setImagePreview(""); }}><div className="relative flex max-h-[90vh] max-w-[92vw] items-center justify-center rounded-2xl bg-white p-3 shadow-2xl"><button type="button" onClick={() => setImagePreview("")} aria-label="Close image preview" className="absolute -right-3 -top-3 z-10 grid size-10 place-items-center rounded-full bg-white text-foreground shadow-lg"><X className="size-5" /></button><img src={imagePreview} alt="Product preview" onError={() => setImagePreview("")} className="max-h-[84vh] max-w-full rounded-xl object-contain" /></div></div>}
      </main>
    </PageShell>
  );
}

function UploadNames({ label, hint, names, onChange }: { label: string; hint: string; names: string[]; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <div className="rounded-xl border border-dashed border-border p-4"><label className="flex cursor-pointer items-center gap-3"><ImagePlus className="size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><b className="block text-sm">{label}</b><span className="text-xs text-muted-foreground">{hint}</span></span><span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">Choose files</span><input type="file" accept="image/*" multiple className="sr-only" onChange={onChange} /></label>{names.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{names.map((name, index) => <span key={`${name}-${index}`} className="max-w-full truncate rounded-full bg-muted px-2.5 py-1 text-[11px]">{name}</span>)}</div>}</div>;
}

function RichEditor({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="min-w-0 sm:col-span-1"><label className="text-sm font-semibold">{label}</label><div className="mt-1.5 overflow-hidden rounded-xl border border-border bg-background"><div className="flex items-center gap-1 border-b border-border bg-muted/50 p-1.5"><button type="button" title="Bold" onClick={() => document.execCommand("bold")} className="grid size-8 place-items-center rounded font-bold hover:bg-background">B</button><button type="button" title="Italic" onClick={() => document.execCommand("italic")} className="grid size-8 place-items-center rounded italic hover:bg-background">I</button><button type="button" title="Bulleted list" onClick={() => document.execCommand("insertUnorderedList")} className="grid size-8 place-items-center rounded text-sm hover:bg-background">• List</button><span className="ml-auto text-[10px] font-medium text-muted-foreground">Rich text editor</span></div><div contentEditable suppressContentEditableWarning onInput={(event) => onChange(event.currentTarget.innerText)} className="min-h-32 whitespace-pre-wrap p-3 text-sm outline-none empty:before:text-muted-foreground empty:before:content-['Write_here…']">{value}</div></div></div>;
}
