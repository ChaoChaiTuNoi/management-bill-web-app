"use client";

import { useEffect, useState } from "react";
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

type ProductItem = { id: string; name: string; category?: { id: string; name: string } };

export default function MasterDataPage() {
  const [categoryName, setCategoryName] = useState("");
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [editValues, setEditValues] = useState({ name: "", categoryId: "" });

  async function loadData() {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch("/api/master-data/categories"),
      fetch("/api/master-data/products")
    ]);
    setCategories(await categoriesRes.json());
    setProducts(await productsRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleEditSave() {
    if (!editingProduct) return;
    const response = await fetch(`/api/master-data/products/${editingProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues)
    });
    if (!response.ok) return;
    setEditingProduct(null);
    loadData();
  }

  async function handleDeleteConfirm() {
    if (!deletingProduct) return;
    const response = await fetch(`/api/master-data/products/${deletingProduct.id}`, { method: "DELETE" });
    if (!response.ok) return;
    setDeletingProduct(null);
    loadData();
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">ข้อมูลหลัก</h1>
        <p className="text-sm text-muted-foreground">จัดการหมวดหมู่และสินค้าเพื่อใช้งานในทุกโมดูล</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มหมวดหมู่</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="master-category-name">ชื่อหมวดหมู่</Label>
              <Input
                id="master-category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="ชื่อหมวดหมู่"
              />
            </div>
            <Button
              className="w-full md:w-auto"
              onClick={async () => {
                await fetch("/api/master-data/categories", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: categoryName })
                });
                setCategoryName("");
                loadData();
              }}
            >
              บันทึกหมวดหมู่
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>เพิ่มสินค้า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="master-product-name">ชื่อสินค้า</Label>
              <Input
                id="master-product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="ชื่อสินค้า"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="master-product-category">หมวดหมู่</Label>
              <select
                id="master-product-category"
                className="h-10 w-full rounded-md border border-input px-3"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              className="w-full md:w-auto"
              onClick={async () => {
                await fetch("/api/master-data/products", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: productName, categoryId })
                });
                setProductName("");
                setCategoryId("");
                loadData();
              }}
            >
              บันทึกสินค้า
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้า</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category?.name ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(product);
                          setEditValues({
                            name: product.name,
                            categoryId: product.category?.id ?? ""
                          });
                        }}
                      >
                        แก้ไข
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => setDeletingProduct(product)}>
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

      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขสินค้า</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลสินค้าได้ครบทุกช่อง</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>ชื่อสินค้า *</Label>
              <Input value={editValues.name} onChange={(e) => setEditValues((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>หมวดหมู่ *</Label>
              <select
                className="h-10 w-full rounded-md border border-input px-3"
                value={editValues.categoryId}
                onChange={(e) => setEditValues((prev) => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
              ยกเลิก
            </Button>
            <Button type="button" onClick={handleEditSave}>
              บันทึกการแก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingProduct)} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
            <AlertDialogDescription>หากลบแล้วจะไม่สามารถเรียกคืนได้ ต้องการลบรายการนี้หรือไม่?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline">
                ยกเลิก
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
                ยืนยันลบ
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
