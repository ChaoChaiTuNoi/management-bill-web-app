"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTaxRecordSchema } from "@/lib/validators/tax-record.validator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type FormValues = z.infer<typeof createTaxRecordSchema>;
type TaxItem = {
  id: string;
  taxType: string;
  billName: string;
  amount: string;
  taxDate: string;
};

const TAX_TYPE_OPTIONS = ["ภาษีมูลค่าเพิ่ม", "ภาษีหัก ณ ที่จ่าย", "อากรแสตมป์", "ภาษีธุรกิจเฉพาะ", "อื่นๆ"];

export default function TaxPage() {
  const [items, setItems] = useState<TaxItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingItem, setEditingItem] = useState<TaxItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TaxItem | null>(null);
  const [editValues, setEditValues] = useState({
    taxType: "",
    billName: "",
    amount: 0,
    taxDate: ""
  });
  const openDatePicker = (event: { currentTarget: HTMLInputElement }) => {
    try {
      event.currentTarget.showPicker?.();
    } catch {
      // Ignore browsers that block picker opening without strict user gesture.
    }
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(createTaxRecordSchema)
  });

  async function loadItems() {
    setItemsLoading(true);
    try {
      const response = await fetch("/api/tax-records");
      if (!response.ok) throw new Error("โหลดรายการภาษีไม่สำเร็จ");
      setItems(await response.json());
    } catch {
      setErrorMessage("ไม่สามารถโหลดรายการภาษีได้");
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleEditSave() {
    if (!editingItem) return;
    setErrorMessage("");
    setIsSavingEdit(true);
    const response = await fetch(`/api/tax-records/${editingItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxType: editValues.taxType,
        billName: editValues.billName,
        amount: editValues.amount,
        taxDate: `${editValues.taxDate}T00:00:00.000Z`
      })
    });
    try {
      if (!response.ok) return setErrorMessage("ไม่สามารถแก้ไขรายการภาษีได้");
      setEditingItem(null);
      setMessage("แก้ไขรายการภาษีเรียบร้อย");
      loadItems();
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    setErrorMessage("");
    setIsDeleting(true);
    const response = await fetch(`/api/tax-records/${deletingItem.id}`, { method: "DELETE" });
    try {
      if (!response.ok) return setErrorMessage("ไม่สามารถลบรายการภาษีได้");
      setDeletingItem(null);
      setMessage("ลบรายการภาษีเรียบร้อย");
      loadItems();
    } finally {
      setIsDeleting(false);
    }
  }

  function formatCurrency(value: string | number) {
    return Number(value || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="page-hero">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Tax Management</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">บันทึกภาษี</h1>
        <p className="mt-1 text-sm text-muted-foreground">จัดเก็บข้อมูลภาษีเพื่อใช้สรุปยอดและวิเคราะห์รายจ่าย</p>
      </div>
      <Card className="border-white/80">
        <CardHeader>
          <CardTitle>เพิ่มรายการภาษี</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit(async (values) => {
              setMessage("");
              setErrorMessage("");
              setIsSubmitting(true);
              try {
                const response = await fetch("/api/tax-records", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(values)
                });
                if (!response.ok) {
                  setErrorMessage("ไม่สามารถบันทึกรายการภาษีได้");
                  return;
                }
                form.reset();
                setMessage("บันทึกรายการภาษีเรียบร้อย");
                loadItems();
              } finally {
                setIsSubmitting(false);
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="tax-type">ประเภทภาษี *</Label>
              <select id="tax-type" className="h-10 w-full rounded-md border border-input px-3" {...form.register("taxType")}>
                <option value="">เลือกประเภทภาษี</option>
                {TAX_TYPE_OPTIONS.map((taxType) => (
                  <option key={taxType} value={taxType}>
                    {taxType}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">ตอนนี้ใช้รายการมาตรฐานชั่วคราว ก่อนมี Master Data ภาษี</p>
              {form.formState.errors.taxType ? <p className="text-xs text-rose-600">{form.formState.errors.taxType.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-bill-name">ชื่อบิล *</Label>
              <Input id="tax-bill-name" placeholder="กรอกชื่อบิล" {...form.register("billName")} />
              {form.formState.errors.billName ? <p className="text-xs text-rose-600">{form.formState.errors.billName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-amount">จำนวนเงิน (บาท) *</Label>
              <Input id="tax-amount" type="number" step="0.01" placeholder="กรอกจำนวนเงิน" {...form.register("amount")} />
              {form.formState.errors.amount ? <p className="text-xs text-rose-600">{form.formState.errors.amount.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-date">วันที่ภาษี *</Label>
              <Input id="tax-date" type="date" onClick={openDatePicker} {...form.register("taxDate")} />
              {form.formState.errors.taxDate ? <p className="text-xs text-rose-600">{form.formState.errors.taxDate.message}</p> : null}
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>{isSubmitting ? "กำลังบันทึก..." : "บันทึก"}</Button>
            </div>
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
        <CardHeader>
          <CardTitle>รายการภาษีล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ประเภทภาษี</TableHead>
                <TableHead>ชื่อบิล</TableHead>
                <TableHead>จำนวนเงิน</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">กำลังโหลดข้อมูล...</TableCell>
                </TableRow>
              ) : null}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.taxType}</TableCell>
                  <TableCell>{item.billName}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{new Date(item.taxDate).toLocaleDateString("th-TH")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(item);
                          setEditValues({
                            taxType: item.taxType,
                            billName: item.billName,
                            amount: Number(item.amount),
                            taxDate: item.taxDate.slice(0, 10)
                          });
                        }}
                      >
                        แก้ไข
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => setDeletingItem(item)}>
                        ลบ
                      </Button>
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
          <DialogHeader>
            <DialogTitle>แก้ไขรายการภาษี</DialogTitle>
            <DialogDescription>ปรับข้อมูลรายการภาษีได้ครบทุกช่อง</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ประเภทภาษี *</Label>
              <select
                className="h-10 w-full rounded-md border border-input px-3"
                value={editValues.taxType}
                onChange={(e) => setEditValues((prev) => ({ ...prev, taxType: e.target.value }))}
              >
                <option value="">เลือกประเภทภาษี</option>
                {TAX_TYPE_OPTIONS.map((taxType) => (
                  <option key={taxType} value={taxType}>
                    {taxType}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>ชื่อบิล *</Label>
              <Input
                value={editValues.billName}
                onChange={(e) => setEditValues((prev) => ({ ...prev, billName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>จำนวนเงิน (บาท) *</Label>
              <Input
                type="number"
                step="0.01"
                value={editValues.amount}
                onChange={(e) => setEditValues((prev) => ({ ...prev, amount: Number(e.target.value || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>วันที่ภาษี *</Label>
              <Input
                type="date"
                onClick={openDatePicker}
                value={editValues.taxDate}
                onChange={(e) => setEditValues((prev) => ({ ...prev, taxDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
              ยกเลิก
            </Button>
            <Button type="button" onClick={handleEditSave} disabled={isSavingEdit}>{isSavingEdit ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle>
            <AlertDialogDescription>รายการที่ถูกลบจะไม่สามารถกู้คืนได้ ต้องการดำเนินการต่อหรือไม่?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline">
                ยกเลิก
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>{isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
