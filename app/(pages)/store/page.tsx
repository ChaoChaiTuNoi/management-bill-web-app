"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createStoreTransactionSchema } from "@/lib/validators/store-transaction.validator";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductCombobox } from "@/components/product-combobox";

type FormValues = z.infer<typeof createStoreTransactionSchema>;
type EditStoreValues = {
  productId: string;
  transactionType: "INCOME" | "EXPENSE";
  pricePerUnit: number;
  weightKg: number;
  totalPrice: number;
  billDate: string;
};
type StoreItem = {
  id: string;
  transactionType: "INCOME" | "EXPENSE";
  pricePerUnit: string;
  totalPrice: string;
  weightKg: string;
  billDate: string;
  product?: { id: string; name: string };
};
type StoreListResponse = {
  items: StoreItem[];
  total: number;
  limit: number;
  offset: number;
};
type SortBy = "billDate" | "totalPrice" | "productName";
type SortOrder = "asc" | "desc";

function StorePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<StoreItem | null>(null);
  const [queryText, setQueryText] = useState(searchParams.get("search") ?? "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [selectedType, setSelectedType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    (searchParams.get("transactionType") as "INCOME" | "EXPENSE" | null) ?? "ALL"
  );
  const [startDate, setStartDate] = useState(searchParams.get("startDate") ?? "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? "");
  const [sortBy, setSortBy] = useState<SortBy>((searchParams.get("sortBy") as SortBy | null) ?? "billDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get("sortOrder") as SortOrder | null) ?? "desc");
  const [page, setPage] = useState(Math.max(Number(searchParams.get("page") ?? "1"), 1));
  const pageSize = 10;
  const [editValues, setEditValues] = useState<EditStoreValues>({
    productId: "",
    transactionType: "INCOME",
    pricePerUnit: 0,
    weightKg: 0,
    totalPrice: 0,
    billDate: ""
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(createStoreTransactionSchema),
    defaultValues: { productId: "", transactionType: "INCOME" }
  });

  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      params.set("offset", String((page - 1) * pageSize));
      if (queryText.trim()) params.set("search", queryText.trim());
      if (selectedType !== "ALL") params.set("transactionType", selectedType);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const response = await fetch(`/api/store-transactions?${params.toString()}`);
      if (!response.ok) throw new Error("โหลดรายการร้านค้าไม่สำเร็จ");
      const data = (await response.json()) as StoreListResponse;
      setItems(data.items);
      setTotalItems(data.total);
    } catch {
      setErrorMessage("ไม่สามารถโหลดรายการร้านค้าได้");
    } finally {
      setItemsLoading(false);
    }
  }, [endDate, page, queryText, selectedType, sortBy, sortOrder, startDate]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/master-data/products");
      setProducts(await response.json());
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (queryText.trim()) params.set("search", queryText.trim());
    if (selectedType !== "ALL") params.set("transactionType", selectedType);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", String(page));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [queryText, selectedType, startDate, endDate, sortBy, sortOrder, page, pathname, router]);

  const pricePerUnit = form.watch("pricePerUnit");
  const weightKg = form.watch("weightKg");
  const openDatePicker = (event: { currentTarget: HTMLInputElement }) => {
    try {
      event.currentTarget.showPicker?.();
    } catch {}
  };

  useEffect(() => {
    const price = Number(pricePerUnit) || 0;
    const weight = Number(weightKg) || 0;
    form.setValue("totalPrice", Number((price * weight).toFixed(2)), { shouldValidate: true });
  }, [pricePerUnit, weightKg, form]);

  function openEditDialog(item: StoreItem) {
    setEditingItem(item);
    setEditValues({
      productId: item.product?.id ?? "",
      transactionType: item.transactionType,
      pricePerUnit: Number(item.pricePerUnit),
      weightKg: Number(item.weightKg),
      totalPrice: Number(item.totalPrice),
      billDate: item.billDate.slice(0, 10)
    });
  }

  async function handleEditSave() {
    if (!editingItem) return;
    setErrorMessage("");
    setIsSavingEdit(true);
    const response = await fetch(`/api/store-transactions/${editingItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: editValues.productId,
        transactionType: editValues.transactionType,
        pricePerUnit: editValues.pricePerUnit,
        weightKg: editValues.weightKg,
        totalPrice: Number((editValues.pricePerUnit * editValues.weightKg).toFixed(2)),
        billDate: `${editValues.billDate}T00:00:00.000Z`
      })
    });
    try {
      if (!response.ok) return setErrorMessage("ไม่สามารถแก้ไขรายการร้านค้าได้");
      setEditingItem(null);
      setMessage("แก้ไขรายการร้านค้าเรียบร้อย");
      loadItems();
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    setErrorMessage("");
    setIsDeleting(true);
    const response = await fetch(`/api/store-transactions/${deletingItem.id}`, { method: "DELETE" });
    try {
      if (!response.ok) return setErrorMessage("ไม่สามารถลบรายการร้านค้าได้");
      setDeletingItem(null);
      setMessage("ลบรายการร้านค้าเรียบร้อย");
      loadItems();
    } finally {
      setIsDeleting(false);
    }
  }

  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);
  const pageSummary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const value = Number(item.totalPrice || 0);
        if (item.transactionType === "INCOME") acc.income += value;
        if (item.transactionType === "EXPENSE") acc.expense += value;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [items]);

  function applyFilters() {
    setErrorMessage("");
    setPage(1);
    setQueryText(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setQueryText("");
    setSelectedType("ALL");
    setStartDate("");
    setEndDate("");
    setSortBy("billDate");
    setSortOrder("desc");
    setPage(1);
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getTypePillClass(type: "INCOME" | "EXPENSE") {
    if (type === "INCOME") {
      return "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700";
    }
    return "inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700";
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="page-hero">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Store Transactions</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">รายการร้านค้า</h1>
        <p className="mt-1 text-sm text-muted-foreground">จัดการรายรับและรายจ่ายของร้านค้าแบบง่ายและรวดเร็ว</p>
      </div>
      <Card className="border-white/80">
        <CardHeader><CardTitle>เพิ่มรายการร้านค้า</CardTitle></CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit(async (values) => {
              setMessage("");
              setErrorMessage("");
              setIsSubmitting(true);
              try {
                const response = await fetch("/api/store-transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
                if (!response.ok) {
                  setErrorMessage("ไม่สามารถบันทึกรายการร้านค้าได้");
                  return;
                }
                form.reset({ productId: "", transactionType: "INCOME" });
                setMessage("บันทึกรายการร้านค้าเรียบร้อย");
                loadItems();
              } finally {
                setIsSubmitting(false);
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="store-product-id">สินค้า *</Label>
              <Controller control={form.control} name="productId" render={({ field }) => (
                <ProductCombobox id="store-product-id" value={field.value} products={products} loading={productsLoading} onChange={(id) => form.setValue("productId", id, { shouldDirty: true, shouldValidate: true })} />
              )} />
              {form.formState.errors.productId ? <p className="text-xs text-rose-600">{form.formState.errors.productId.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-transaction-type">ประเภทรายการ *</Label>
              <select id="store-transaction-type" className="block h-10 w-full rounded-md border border-input px-3" {...form.register("transactionType")}>
                <option value="INCOME">รายรับ</option>
                <option value="EXPENSE">รายจ่าย</option>
              </select>
              {form.formState.errors.transactionType ? <p className="text-xs text-rose-600">{form.formState.errors.transactionType.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-price-per-unit">ราคาต่อหน่วย (บาท) *</Label>
              <Input id="store-price-per-unit" type="number" step="0.1" {...form.register("pricePerUnit")} />
              {form.formState.errors.pricePerUnit ? <p className="text-xs text-rose-600">{form.formState.errors.pricePerUnit.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-weight-kg">น้ำหนัก (กก.) *</Label>
              <Input id="store-weight-kg" type="number" step="0.1" {...form.register("weightKg")} />
              {form.formState.errors.weightKg ? <p className="text-xs text-rose-600">{form.formState.errors.weightKg.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-total-price">ราคารวม (บาท) *</Label>
              <Input id="store-total-price" type="number" step="0.01" disabled readOnly {...form.register("totalPrice")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-transaction-date">วันที่ทำรายการ *</Label>
              <Input id="store-transaction-date" type="date" onClick={openDatePicker} {...form.register("billDate")} />
              {form.formState.errors.billDate ? <p className="text-xs text-rose-600">{form.formState.errors.billDate.message}</p> : null}
            </div>
            <div className="flex items-end"><Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>{isSubmitting ? "กำลังบันทึก..." : "บันทึก"}</Button></div>
          </form>
          {message ? (
            <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
          ) : null}
          {errorMessage ? (
            <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-white/80">
        <CardHeader><CardTitle>ค้นหาและกรองรายการ</CardTitle></CardHeader>
        <CardContent>
          <div className="sticky top-[84px] z-10 rounded-xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="store-search">ค้นหาสินค้าหรือหมวดหมู่</Label>
              <Input
                id="store-search"
                placeholder="พิมพ์ชื่อสินค้า/หมวดหมู่"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-filter-type">ประเภทรายการ</Label>
              <select
                id="store-filter-type"
                className="block h-10 w-full rounded-md border border-input px-3"
                value={selectedType}
                onChange={(event) => {
                  setSelectedType(event.target.value as "ALL" | "INCOME" | "EXPENSE");
                  setPage(1);
                }}
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="INCOME">รายรับ</option>
                <option value="EXPENSE">รายจ่าย</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-start-date">วันที่เริ่มต้น</Label>
              <Input
                id="store-start-date"
                type="date"
                value={startDate}
                onClick={openDatePicker}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-end-date">วันที่สิ้นสุด</Label>
              <Input
                id="store-end-date"
                type="date"
                value={endDate}
                onClick={openDatePicker}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-sort-by">เรียงตาม</Label>
              <select
                id="store-sort-by"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortBy);
                  setPage(1);
                }}
              >
                <option value="billDate">วันที่ทำรายการ</option>
                <option value="totalPrice">ราคารวม</option>
                <option value="productName">ชื่อสินค้า</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-sort-order">ลำดับ</Label>
              <select
                id="store-sort-order"
                value={sortOrder}
                onChange={(event) => {
                  setSortOrder(event.target.value as SortOrder);
                  setPage(1);
                }}
              >
                <option value="desc">มากไปน้อย / ล่าสุด</option>
                <option value="asc">น้อยไปมาก / เก่าสุด</option>
              </select>
            </div>
            <div className="flex items-end gap-2 md:col-span-5">
              <Button type="button" onClick={applyFilters}>
                ค้นหา
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters}>
                ล้างตัวกรอง
              </Button>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">รายรับ (หน้านี้)</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600">{formatCurrency(pageSummary.income)} บาท</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">รายจ่าย (หน้านี้)</p>
            <p className="mt-1 text-xl font-semibold text-rose-600">{formatCurrency(pageSummary.expense)} บาท</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">ยอดสุทธิ (หน้านี้)</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCurrency(pageSummary.income - pageSummary.expense)} บาท
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/80">
        <CardHeader>
          <CardTitle>รายการล่าสุด</CardTitle>
          <p className="text-sm text-muted-foreground">
            แสดง {rangeStart}-{rangeEnd} จากทั้งหมด {totalItems} รายการ
          </p>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 sm:pt-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>สินค้า</TableHead><TableHead>ประเภท</TableHead><TableHead className="text-right">ราคารวม(บาท)</TableHead><TableHead>วันที่</TableHead><TableHead>จัดการ</TableHead></TableRow></TableHeader>
            <TableBody>
              {itemsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">กำลังโหลดข้อมูล...</TableCell>
                </TableRow>
              ) : null}
              {!itemsLoading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    ไม่พบรายการตามเงื่อนไขที่เลือก
                  </TableCell>
                </TableRow>
              ) : null}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product?.name ?? "-"}</TableCell>
                  <TableCell>
                    <span className={getTypePillClass(item.transactionType)}>
                      {item.transactionType === "INCOME" ? "รายรับ" : "รายจ่าย"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(Number(item.totalPrice || 0))}</TableCell>
                  <TableCell>{new Date(item.billDate).toLocaleDateString("th-TH")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEditDialog(item)}>แก้ไข</Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => setDeletingItem(item)}>ลบ</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <div className="mt-4 flex items-center justify-between px-4 sm:px-0">
            <Button type="button" variant="outline" disabled={page <= 1 || itemsLoading} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
              ก่อนหน้า
            </Button>
            <p className="text-sm text-muted-foreground">
              หน้า {page} / {totalPages}
            </p>
            <Button type="button" variant="outline" disabled={page >= totalPages || itemsLoading} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}>
              ถัดไป
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>แก้ไขรายการร้านค้า</DialogTitle><DialogDescription>แก้ไขข้อมูลได้ครบทุกช่องเหมือนตอนเพิ่มรายการ</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>สินค้า *</Label><ProductCombobox value={editValues.productId} products={products} loading={productsLoading} onChange={(id) => setEditValues((prev) => ({ ...prev, productId: id }))} /></div>
            <div className="space-y-2"><Label>ประเภทรายการ *</Label><select className="h-10 w-full rounded-md border border-input px-3" value={editValues.transactionType} onChange={(e) => setEditValues((prev) => ({ ...prev, transactionType: e.target.value as "INCOME" | "EXPENSE" }))}><option value="INCOME">รายรับ</option><option value="EXPENSE">รายจ่าย</option></select></div>
            <div className="space-y-2"><Label>ราคาต่อหน่วย (บาท) *</Label><Input type="number" step="0.1" value={editValues.pricePerUnit} onChange={(e) => { const value = Number(e.target.value || 0); setEditValues((prev) => ({ ...prev, pricePerUnit: value, totalPrice: Number((value * prev.weightKg).toFixed(2)) })); }} /></div>
            <div className="space-y-2"><Label>น้ำหนัก (กก.) *</Label><Input type="number" step="0.1" value={editValues.weightKg} onChange={(e) => { const value = Number(e.target.value || 0); setEditValues((prev) => ({ ...prev, weightKg: value, totalPrice: Number((prev.pricePerUnit * value).toFixed(2)) })); }} /></div>
            <div className="space-y-2"><Label>ราคารวม (บาท)</Label><Input type="number" step="0.01" disabled readOnly value={editValues.totalPrice} /></div>
            <div className="space-y-2"><Label>วันที่ทำรายการ *</Label><Input type="date" onClick={openDatePicker} value={editValues.billDate} onChange={(e) => setEditValues((prev) => ({ ...prev, billDate: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setEditingItem(null)}>ยกเลิก</Button><Button type="button" onClick={handleEditSave} disabled={isSavingEdit}>{isSavingEdit ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle><AlertDialogDescription>รายการที่ถูกลบจะไม่สามารถกู้คืนได้ ต้องการดำเนินการต่อหรือไม่?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild><Button type="button" variant="outline">ยกเลิก</Button></AlertDialogCancel>
            <AlertDialogAction asChild><Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>{isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}</Button></AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">กำลังโหลดหน้า...</div>}>
      <StorePageContent />
    </Suspense>
  );
}
