"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFactoryBillSchema } from "@/lib/validators/factory-bill.validator";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductCombobox } from "@/components/product-combobox";

type FormValues = z.infer<typeof createFactoryBillSchema>;
type EditFactoryBillValues = { productId: string; pricePerUnit: number; weightKg: number; totalPrice: number; billDate: string };
type FactoryBillItem = { id: string; product: { id: string; name: string }; pricePerUnit: string; totalPrice: string; weightKg: string; billDate: string };

export default function FactoryBillsPage() {
  const [items, setItems] = useState<FactoryBillItem[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [editingItem, setEditingItem] = useState<FactoryBillItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FactoryBillItem | null>(null);
  const [editValues, setEditValues] = useState<EditFactoryBillValues>({ productId: "", pricePerUnit: 0, weightKg: 0, totalPrice: 0, billDate: "" });

  const form = useForm<FormValues>({
    resolver: zodResolver(createFactoryBillSchema),
    defaultValues: { productId: "", pricePerUnit: 0, totalPrice: 0, weightKg: 0, billDate: new Date() }
  });

  async function loadItems() {
    setItemsLoading(true);
    try {
      const response = await fetch("/api/factory-bills");
      if (!response.ok) throw new Error("โหลดรายการบิลโรงงานไม่สำเร็จ");
      setItems(await response.json());
    } catch {
      setErrorMessage("ไม่สามารถโหลดรายการบิลโรงงานได้");
    } finally {
      setItemsLoading(false);
    }
  }
  async function loadProducts() {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/master-data/products");
      if (!response.ok) throw new Error("โหลดรายการสินค้าไม่สำเร็จ");
      setProducts(await response.json());
    } catch {
      setErrorMessage("ไม่สามารถโหลดข้อมูลสินค้าได้");
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

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/factory-bills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message ?? "ไม่สามารถบันทึกบิลโรงงานได้");
        return;
      }
      setMessage("บันทึกบิลโรงงานเรียบร้อย");
      form.reset();
      loadItems();
    } finally {
      setIsSubmitting(false);
    }
  });

  function openEditDialog(item: FactoryBillItem) {
    setEditingItem(item);
    setEditValues({ productId: item.product.id, pricePerUnit: Number(item.pricePerUnit), weightKg: Number(item.weightKg), totalPrice: Number(item.totalPrice), billDate: item.billDate.slice(0, 10) });
  }
  async function handleEditSave() {
    if (!editingItem) return;
    setErrorMessage("");
    setIsSavingEdit(true);
    const response = await fetch(`/api/factory-bills/${editingItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: editValues.productId,
        pricePerUnit: editValues.pricePerUnit,
        weightKg: editValues.weightKg,
        totalPrice: Number((editValues.pricePerUnit * editValues.weightKg).toFixed(2)),
        billDate: `${editValues.billDate}T00:00:00.000Z`
      })
    });
    try {
      if (!response.ok) return setErrorMessage("ไม่สามารถแก้ไขบิลโรงงานได้");
      setEditingItem(null);
      setMessage("แก้ไขบิลโรงงานเรียบร้อย");
      loadItems();
    } finally {
      setIsSavingEdit(false);
    }
  }
  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    setErrorMessage("");
    setIsDeleting(true);
    const response = await fetch(`/api/factory-bills/${deletingItem.id}`, { method: "DELETE" });
    try {
      if (!response.ok) return setErrorMessage("ไม่สามารถลบบิลโรงงานได้");
      setDeletingItem(null);
      setMessage("ลบบิลโรงงานเรียบร้อย");
      loadItems();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">บิลโรงงาน</h1>
        <p className="text-sm text-muted-foreground">บันทึกรายการบิลโรงงานและตรวจสอบข้อมูลล่าสุด</p>
      </div>
      <Card>
        <CardHeader><CardTitle>เพิ่มบิลโรงงาน</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="factory-product-id">สินค้า *</Label>
              <Controller control={form.control} name="productId" render={({ field }) => <ProductCombobox id="factory-product-id" value={field.value} products={products} loading={productsLoading} onChange={(id) => form.setValue("productId", id, { shouldDirty: true, shouldValidate: true })} />} />
            </div>
            <div className="space-y-2"><Label htmlFor="factory-price-per-unit">ราคาต่อหน่วย (บาท) *</Label><Input id="factory-price-per-unit" type="number" step="0.01" {...form.register("pricePerUnit")} /></div>
            <div className="space-y-2"><Label htmlFor="factory-weight-kg">น้ำหนัก (กก.) *</Label><Input id="factory-weight-kg" type="number" step="0.001" {...form.register("weightKg")} /></div>
            <div className="space-y-2"><Label htmlFor="factory-total-price">ราคารวม (บาท) *</Label><Input id="factory-total-price" type="number" step="0.01" disabled readOnly {...form.register("totalPrice")} /></div>
            <div className="space-y-2"><Label htmlFor="factory-bill-date">วันที่บิล *</Label><Input id="factory-bill-date" type="date" onClick={openDatePicker} {...form.register("billDate")} /></div>
            <div className="flex items-end"><Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>{isSubmitting ? "กำลังบันทึก..." : "บันทึก"}</Button></div>
          </form>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
          {errorMessage ? <p className="mt-2 text-sm text-red-600">{errorMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>รายการบิลโรงงานล่าสุด</CardTitle></CardHeader>
        <CardContent className="px-0 sm:px-6 sm:pt-0">
          <Table>
            <TableHeader><TableRow><TableHead>สินค้า</TableHead><TableHead>ราคาต่อหน่วย(บาท)</TableHead><TableHead>ราคารวม(บาท)</TableHead><TableHead>น้ำหนัก(กก.)</TableHead><TableHead>วันที่</TableHead><TableHead>จัดการ</TableHead></TableRow></TableHeader>
            <TableBody>
              {itemsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">กำลังโหลดข้อมูล...</TableCell>
                </TableRow>
              ) : null}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product?.name ?? "-"}</TableCell><TableCell>{item.pricePerUnit}</TableCell><TableCell>{item.totalPrice}</TableCell><TableCell>{item.weightKg}</TableCell><TableCell>{new Date(item.billDate).toLocaleDateString()}</TableCell>
                  <TableCell><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => openEditDialog(item)}>แก้ไข</Button><Button type="button" size="sm" variant="destructive" onClick={() => setDeletingItem(item)}>ลบ</Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>แก้ไขบิลโรงงาน</DialogTitle><DialogDescription>แก้ไขข้อมูลได้ครบทุกช่องเหมือนตอนเพิ่มรายการ</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>สินค้า *</Label><ProductCombobox value={editValues.productId} products={products} loading={productsLoading} onChange={(id) => setEditValues((prev) => ({ ...prev, productId: id }))} /></div>
            <div className="space-y-2"><Label>ราคาต่อหน่วย (บาท) *</Label><Input type="number" step="0.01" value={editValues.pricePerUnit} onChange={(e) => { const value = Number(e.target.value || 0); setEditValues((prev) => ({ ...prev, pricePerUnit: value, totalPrice: Number((value * prev.weightKg).toFixed(2)) })); }} /></div>
            <div className="space-y-2"><Label>น้ำหนัก (กก.) *</Label><Input type="number" step="0.001" value={editValues.weightKg} onChange={(e) => { const value = Number(e.target.value || 0); setEditValues((prev) => ({ ...prev, weightKg: value, totalPrice: Number((prev.pricePerUnit * value).toFixed(2)) })); }} /></div>
            <div className="space-y-2"><Label>ราคารวม (บาท)</Label><Input type="number" step="0.01" disabled readOnly value={editValues.totalPrice} /></div>
            <div className="space-y-2"><Label>วันที่บิล *</Label><Input type="date" onClick={openDatePicker} value={editValues.billDate} onChange={(e) => setEditValues((prev) => ({ ...prev, billDate: e.target.value }))} /></div>
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
