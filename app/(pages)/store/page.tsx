"use client";

import { useEffect, useState } from "react";
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

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
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

  async function loadItems() {
    setItemsLoading(true);
    try {
      const response = await fetch("/api/store-transactions");
      if (!response.ok) throw new Error("โหลดรายการร้านค้าไม่สำเร็จ");
      setItems(await response.json());
    } catch {
      setErrorMessage("ไม่สามารถโหลดรายการร้านค้าได้");
    } finally {
      setItemsLoading(false);
    }
  }

  async function loadProducts() {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/master-data/products");
      setProducts(await response.json());
    } finally {
      setProductsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    loadProducts();
  }, []);

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

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">รายการร้านค้า</h1>
        <p className="text-sm text-muted-foreground">จัดการรายรับและรายจ่ายของร้านค้าแบบง่ายและรวดเร็ว</p>
      </div>
      <Card>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-transaction-type">ประเภทรายการ *</Label>
              <select id="store-transaction-type" className="block h-10 w-full rounded-md border border-input px-3" {...form.register("transactionType")}>
                <option value="INCOME">รายรับ</option>
                <option value="EXPENSE">รายจ่าย</option>
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="store-price-per-unit">ราคาต่อหน่วย (บาท) *</Label><Input id="store-price-per-unit" type="number" step="0.1" {...form.register("pricePerUnit")} /></div>
            <div className="space-y-2"><Label htmlFor="store-weight-kg">น้ำหนัก (กก.) *</Label><Input id="store-weight-kg" type="number" step="0.1" {...form.register("weightKg")} /></div>
            <div className="space-y-2"><Label htmlFor="store-total-price">ราคารวม (บาท) *</Label><Input id="store-total-price" type="number" step="0.01" disabled readOnly {...form.register("totalPrice")} /></div>
            <div className="space-y-2"><Label htmlFor="store-transaction-date">วันที่ทำรายการ *</Label><Input id="store-transaction-date" type="date" onClick={openDatePicker} {...form.register("billDate")} /></div>
            <div className="flex items-end"><Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>{isSubmitting ? "กำลังบันทึก..." : "บันทึก"}</Button></div>
          </form>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
          {errorMessage ? <p className="mt-2 text-sm text-red-600">{errorMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>รายการล่าสุด</CardTitle></CardHeader>
        <CardContent className="px-0 sm:px-6 sm:pt-0">
          <Table>
            <TableHeader><TableRow><TableHead>สินค้า</TableHead><TableHead>ประเภท</TableHead><TableHead>ราคารวม(บาท)</TableHead><TableHead>วันที่</TableHead><TableHead>จัดการ</TableHead></TableRow></TableHeader>
            <TableBody>
              {itemsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">กำลังโหลดข้อมูล...</TableCell>
                </TableRow>
              ) : null}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product?.name ?? "-"}</TableCell>
                  <TableCell>{item.transactionType === "INCOME" ? "รายรับ" : "รายจ่าย"}</TableCell>
                  <TableCell>{item.totalPrice}</TableCell>
                  <TableCell>{new Date(item.billDate).toLocaleDateString()}</TableCell>
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
